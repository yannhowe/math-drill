import type { ArithmeticOperation, QuestionSkillReference } from "./contracts.js";

export type SkillRelationshipType = "PREREQUISITE" | "COMPONENT" | "SUCCESSOR" | "RELATED";

export interface SkillDefinition {
  id: string;
  name: string;
  domain: "arithmetic";
  evidencePolicyId: "fact-fluency-v1";
}

export interface SkillRelationship {
  fromSkillId: string;
  toSkillId: string;
  type: SkillRelationshipType;
}

export const arithmeticSkills: readonly SkillDefinition[] = [
  { id: "arithmetic.addition.facts-within-20", name: "Addition facts within 20", domain: "arithmetic", evidencePolicyId: "fact-fluency-v1" },
  { id: "arithmetic.subtraction.facts-within-20", name: "Subtraction facts within 20", domain: "arithmetic", evidencePolicyId: "fact-fluency-v1" },
  { id: "arithmetic.multiplication.facts-within-12", name: "Multiplication facts through 12 × 12", domain: "arithmetic", evidencePolicyId: "fact-fluency-v1" },
  { id: "arithmetic.division.facts-within-12", name: "Division fact families through 12 × 12", domain: "arithmetic", evidencePolicyId: "fact-fluency-v1" },
  { id: "arithmetic.equivalence.missing-number", name: "Missing-number arithmetic relationships", domain: "arithmetic", evidencePolicyId: "fact-fluency-v1" },
];

/** Directed graph edges; this is not a curriculum hierarchy. */
export const arithmeticSkillRelationships: readonly SkillRelationship[] = [
  { fromSkillId: "arithmetic.addition.facts-within-20", toSkillId: "arithmetic.subtraction.facts-within-20", type: "RELATED" },
  { fromSkillId: "arithmetic.subtraction.facts-within-20", toSkillId: "arithmetic.addition.facts-within-20", type: "RELATED" },
  { fromSkillId: "arithmetic.multiplication.facts-within-12", toSkillId: "arithmetic.division.facts-within-12", type: "PREREQUISITE" },
  { fromSkillId: "arithmetic.division.facts-within-12", toSkillId: "arithmetic.multiplication.facts-within-12", type: "RELATED" },
  { fromSkillId: "arithmetic.addition.facts-within-20", toSkillId: "arithmetic.equivalence.missing-number", type: "COMPONENT" },
  { fromSkillId: "arithmetic.multiplication.facts-within-12", toSkillId: "arithmetic.equivalence.missing-number", type: "COMPONENT" },
];

const operationSkill: Record<ArithmeticOperation, string> = {
  addition: "arithmetic.addition.facts-within-20",
  subtraction: "arithmetic.subtraction.facts-within-20",
  multiplication: "arithmetic.multiplication.facts-within-12",
  division: "arithmetic.division.facts-within-12",
};

export function skillsForArithmeticQuestion(operation: ArithmeticOperation, missing: boolean): QuestionSkillReference[] {
  const skills: QuestionSkillReference[] = [{ skillId: operationSkill[operation], role: "PRIMARY", weight: 1 }];
  if (missing) skills.push({ skillId: "arithmetic.equivalence.missing-number", role: "COMPONENT", weight: 0.35 });
  return skills;
}
