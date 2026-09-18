/**
 * Framework-neutral contracts for a generated drill item.  These are deliberately
 * richer than the first arithmetic renderer needs: presentation, response,
 * scoring and the mathematical task are separate so future renderers do not need
 * to re-encode educational logic in the UI.
 */

export type ArithmeticOperation = "addition" | "subtraction" | "multiplication" | "division";
export type MissingPosition = "left" | "right" | "result";
export type QuestionSkillRole = "PRIMARY" | "COMPONENT" | "RELATED";

export interface QuestionSkillReference {
  skillId: string;
  role: QuestionSkillRole;
  /** Relative contribution to the question; it is evidence metadata, not a score. */
  weight: number;
}

export interface ArithmeticEquationTask {
  kind: "arithmetic-equation";
  operation: ArithmeticOperation;
  left: number;
  right: number;
  result: number;
  missing: MissingPosition;
}

export interface NumericExpectedResponse {
  kind: "numeric";
  value: number;
  acceptedValues: number[];
}

export interface QuestionPresentation {
  renderer: "arithmetic-equation";
  interaction: "numeric-input";
  /** A renderer can safely choose its own accessible textual representation. */
  accessibleText: string;
}

export interface QuestionScoringRule {
  algorithmId: "numeric-exact-v1";
}

export interface GeneratedQuestion {
  schemaVersion: 1;
  id: string;
  task: ArithmeticEquationTask;
  skills: QuestionSkillReference[];
  presentation: QuestionPresentation;
  expectedResponse: NumericExpectedResponse;
  scoring: QuestionScoringRule;
  /** Deterministic generation provenance persisted with attempts. */
  generation: {
    generatorId: "arithmetic-v1";
    generatorVersion: 1;
    seed: number;
  };
  /** Non-calibrated descriptors for difficulty analysis and later modelling. */
  difficultyFeatures: Record<string, number | boolean | string>;
}

export interface NumericResponse {
  kind: "numeric";
  value: string | number;
}

export interface ScoreResult {
  algorithmId: "numeric-exact-v1";
  correct: boolean;
  normalizedResponse: number | null;
  expectedValue: number;
  reason: "correct" | "incorrect" | "invalid-response";
}

export interface ArithmeticGenerationOptions {
  operation: ArithmeticOperation;
  seed: number;
  /** Inclusive lower bound for generated elementary operands. Defaults to 1. */
  minOperand?: number;
  /** Inclusive upper bound for generated elementary operands. Defaults to 12. */
  maxOperand?: number;
  /** Forms to select from. Defaults to all three equation positions. */
  missingPositions?: readonly MissingPosition[];
}
