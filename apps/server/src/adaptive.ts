import { generateArithmeticQuestion, type ArithmeticOperation } from "@math-drill/drill-engine";
import type { Store } from "./store.js";

const operations: ArithmeticOperation[]=["addition","subtraction","multiplication","division"];
export function nextQuestion(store: Store, childId: string, seed: number) {
  const past=store.childAttempts(childId);
  const recent=past.slice(0,8) as Array<{correct:number}>;
  const accuracy=recent.length ? recent.reduce((n,a)=>n+Number(a.correct),0)/recent.length : 0;
  const operation=operations[Math.abs(seed)%operations.length]!;
  const weak=recent.length >= 3 && accuracy < .8;
  const reason=recent.length===0 ? "Placement: establish a starting learning edge." : weak ? `Targeted practice: recent accuracy ${Math.round(accuracy*100)}%.` : accuracy>=.9 ? "Adaptive probe: recent performance is consistently strong." : "Daily practice: reinforce the current learning edge.";
  const maxOperand=accuracy>=.9 ? 12 : 10;
  return { question: generateArithmeticQuestion({operation, seed, minOperand:1, maxOperand}), activityType: recent.length===0 ? "PLACEMENT" as const : accuracy>=.9 ? "PROBE" as const : weak ? "PRACTICE" as const : "REVIEW" as const, reason };
}
