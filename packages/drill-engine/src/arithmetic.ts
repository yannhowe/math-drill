import type { ArithmeticEquationTask, ArithmeticGenerationOptions, ArithmeticOperation, GeneratedQuestion, MissingPosition, NumericResponse, ScoreResult } from "./contracts.js";
import { skillsForArithmeticQuestion } from "./skills.js";

const symbols: Record<ArithmeticOperation, string> = { addition: "+", subtraction: "−", multiplication: "×", division: "÷" };

/** Small seeded PRNG: stable across JS environments and adequate for item selection, never security. */
function randomFromSeed(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pickInteger(random: () => number, min: number, max: number): number {
  return min + Math.floor(random() * (max - min + 1));
}

function validateOptions(options: ArithmeticGenerationOptions): Required<Pick<ArithmeticGenerationOptions, "minOperand" | "maxOperand" | "missingPositions">> {
  const minOperand = options.minOperand ?? 1;
  const maxOperand = options.maxOperand ?? 12;
  const missingPositions = options.missingPositions ?? ["left", "right", "result"];
  if (!Number.isInteger(minOperand) || !Number.isInteger(maxOperand) || minOperand < 0 || maxOperand < minOperand) throw new Error("Operand bounds must be non-negative integers with minOperand <= maxOperand.");
  if (missingPositions.length === 0) throw new Error("At least one missing position is required.");
  if (options.operation === "division" && minOperand === 0 && maxOperand === 0) throw new Error("Division requires a non-zero divisor range.");
  return { minOperand, maxOperand, missingPositions };
}

function makeTask(operation: ArithmeticOperation, random: () => number, min: number, max: number, missing: MissingPosition): ArithmeticEquationTask {
  if (operation === "addition") {
    const left = pickInteger(random, min, max); const right = pickInteger(random, min, max);
    return { kind: "arithmetic-equation", operation, left, right, result: left + right, missing };
  }
  if (operation === "subtraction") {
    const left = pickInteger(random, min, max); const right = pickInteger(random, min, left);
    return { kind: "arithmetic-equation", operation, left, right, result: left - right, missing };
  }
  if (operation === "multiplication") {
    const left = pickInteger(random, min, max); const right = pickInteger(random, min, max);
    return { kind: "arithmetic-equation", operation, left, right, result: left * right, missing };
  }
  const divisorMin = Math.max(1, min);
  const right = pickInteger(random, divisorMin, max);
  const result = pickInteger(random, min, max);
  return { kind: "arithmetic-equation", operation, left: right * result, right, result, missing };
}

function answerFor(task: ArithmeticEquationTask): number {
  return task.missing === "left" ? task.left : task.missing === "right" ? task.right : task.result;
}

function equationText(task: ArithmeticEquationTask): string {
  const left = task.missing === "left" ? "?" : String(task.left);
  const right = task.missing === "right" ? "?" : String(task.right);
  const result = task.missing === "result" ? "?" : String(task.result);
  return `${left} ${symbols[task.operation]} ${right} = ${result}`;
}

function digitCount(value: number): number { return Math.max(1, Math.abs(value).toString().length); }
function hasAdditionCarry(left: number, right: number): boolean {
  let carry = 0; let a = left; let b = right;
  while (a > 0 || b > 0) { if ((a % 10) + (b % 10) + carry >= 10) return true; carry = 0; a = Math.floor(a / 10); b = Math.floor(b / 10); }
  return false;
}

export function generateArithmeticQuestion(options: ArithmeticGenerationOptions): GeneratedQuestion {
  const { minOperand, maxOperand, missingPositions } = validateOptions(options);
  const random = randomFromSeed(options.seed);
  const missing = missingPositions[pickInteger(random, 0, missingPositions.length - 1)]!;
  const task = makeTask(options.operation, random, minOperand, maxOperand, missing);
  const expectedValue = answerFor(task);
  const text = equationText(task);
  return {
    schemaVersion: 1,
    id: `arithmetic-v1:${options.seed}:${options.operation}:${task.left}:${task.right}:${task.result}:${missing}`,
    task,
    skills: skillsForArithmeticQuestion(options.operation, missing !== "result"),
    presentation: { renderer: "arithmetic-equation", interaction: "numeric-input", accessibleText: text },
    expectedResponse: { kind: "numeric", value: expectedValue, acceptedValues: [expectedValue] },
    scoring: { algorithmId: "numeric-exact-v1" },
    generation: { generatorId: "arithmetic-v1", generatorVersion: 1, seed: options.seed },
    difficultyFeatures: {
      operation: options.operation, missingPosition: missing, leftDigits: digitCount(task.left), rightDigits: digitCount(task.right), resultDigits: digitCount(task.result),
      hasZero: task.left === 0 || task.right === 0 || task.result === 0,
      additionCarry: options.operation === "addition" ? hasAdditionCarry(task.left, task.right) : false,
      multiplicationTableMaximum: options.operation === "multiplication" || options.operation === "division" ? Math.max(task.right, task.result) : 0,
    },
  };
}

/** Strict integer parser avoids silently treating "7x" or fractional answers as correct. */
export function parseNumericResponse(response: NumericResponse): number | null {
  if (typeof response.value === "number") return Number.isSafeInteger(response.value) ? response.value : null;
  const trimmed = response.value.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) return null;
  const value = Number(trimmed);
  return Number.isSafeInteger(value) ? value : null;
}

export function scoreNumericResponse(question: GeneratedQuestion, response: NumericResponse): ScoreResult {
  const normalizedResponse = parseNumericResponse(response);
  if (normalizedResponse === null) return { algorithmId: "numeric-exact-v1", correct: false, normalizedResponse, expectedValue: question.expectedResponse.value, reason: "invalid-response" };
  const correct = question.expectedResponse.acceptedValues.includes(normalizedResponse);
  return { algorithmId: "numeric-exact-v1", correct, normalizedResponse, expectedValue: question.expectedResponse.value, reason: correct ? "correct" : "incorrect" };
}
