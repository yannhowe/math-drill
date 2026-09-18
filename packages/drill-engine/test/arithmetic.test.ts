import { describe, expect, it } from "vitest";
import { generateArithmeticQuestion, parseNumericResponse, scoreNumericResponse } from "../src";

describe("deterministic arithmetic generation", () => {
  it("reproduces a question exactly from identical options", () => {
    const options = { operation: "multiplication" as const, seed: 901, minOperand: 1, maxOperand: 12 };
    expect(generateArithmeticQuestion(options)).toEqual(generateArithmeticQuestion(options));
  });

  it.each(["addition", "subtraction", "multiplication", "division"] as const)("makes mathematically valid %s equations", (operation) => {
    for (let seed = 0; seed < 200; seed += 1) {
      const question = generateArithmeticQuestion({ operation, seed, minOperand: 1, maxOperand: 12 });
      const { left, right, result } = question.task;
      if (operation === "addition") expect(left + right).toBe(result);
      if (operation === "subtraction") { expect(left - right).toBe(result); expect(result).toBeGreaterThanOrEqual(0); }
      if (operation === "multiplication") expect(left * right).toBe(result);
      if (operation === "division") { expect(right).toBeGreaterThan(0); expect(left / right).toBe(result); expect(Number.isInteger(left / right)).toBe(true); }
    }
  });

  it.each(["left", "right", "result"] as const)("scores every missing-number form (%s)", (missing) => {
    const question = generateArithmeticQuestion({ operation: "multiplication", seed: 42, missingPositions: [missing] });
    expect(question.task.missing).toBe(missing);
    expect(question.presentation.accessibleText).toContain("?");
    expect(question.skills.some((skill) => skill.skillId === "arithmetic.equivalence.missing-number")).toBe(missing !== "result");
    expect(scoreNumericResponse(question, { kind: "numeric", value: question.expectedResponse.value }).correct).toBe(true);
  });

  it("records both the fact skill and relationship component for missing operands", () => {
    const question = generateArithmeticQuestion({ operation: "division", seed: 8, missingPositions: ["right"] });
    expect(question.skills).toEqual(expect.arrayContaining([
      expect.objectContaining({ skillId: "arithmetic.division.facts-within-12", role: "PRIMARY" }),
      expect.objectContaining({ skillId: "arithmetic.equivalence.missing-number", role: "COMPONENT" }),
    ]));
  });
});

describe("numeric scoring", () => {
  const question = generateArithmeticQuestion({ operation: "addition", seed: 100, missingPositions: ["result"] });

  it("normalizes an integer response but rejects partial or fractional values", () => {
    expect(parseNumericResponse({ kind: "numeric", value: " 007 " })).toBe(7);
    expect(parseNumericResponse({ kind: "numeric", value: "7x" })).toBeNull();
    expect(parseNumericResponse({ kind: "numeric", value: "7.0" })).toBeNull();
    expect(parseNumericResponse({ kind: "numeric", value: Number.NaN })).toBeNull();
  });

  it("distinguishes incorrect from invalid answers", () => {
    expect(scoreNumericResponse(question, { kind: "numeric", value: "not a number" }).reason).toBe("invalid-response");
    expect(scoreNumericResponse(question, { kind: "numeric", value: question.expectedResponse.value + 1 }).reason).toBe("incorrect");
  });
});

describe("generation invariants", () => {
  it("never creates a zero divisor even when zero is allowed as an operand", () => {
    for (let seed = 0; seed < 100; seed += 1) {
      const question = generateArithmeticQuestion({ operation: "division", seed, minOperand: 0, maxOperand: 12 });
      expect(question.task.right).toBeGreaterThan(0);
    }
  });

  it("rejects impossible generation configuration", () => {
    expect(() => generateArithmeticQuestion({ operation: "addition", seed: 1, missingPositions: [] })).toThrow(/At least one/);
    expect(() => generateArithmeticQuestion({ operation: "division", seed: 1, minOperand: 0, maxOperand: 0 })).toThrow(/Division/);
  });
});
