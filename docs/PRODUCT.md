# Math Drill product contract

## Purpose and boundary

Math Drill is a local-first, adaptive **mathematical fluency** trainer for children. Its loop is `PRESENT → ANSWER → MEASURE → ADAPT → REPEAT`. It develops accurate, efficient, consistent and durable retrieval/execution of knowledge already taught; it is not a lesson sequence, homework solver, general tutor, or a claim of complete curriculum mastery.

The primary child flow is: select profile → **Start daily practice** → answer a short adaptive set → finish. The parent experience explains strengths, weak skills, learning edge, review, longitudinal change, and the reason for practice. Profiles never share state or rankings.

## Product principles

- Treat raw, append-only attempt evidence as truth; all mastery, frontier, review and difficulty estimates are replaceable derived views.
- Separate curriculum context, internal skill mastery, and item difficulty. No universal level is a substitute for any of them.
- Prefer deterministic parameterised questions and explainable selection. The core loop works offline without an LLM, account, telemetry, or cloud service.
- Practise only activities for which retrieval/execution plausibly improves fluency. Flag persistent patterns or possible need for instruction; do not turn the product into a teacher.
- Speed is skill-policy-specific. It matters substantially for facts, not as a universal threshold for multi-step work.
- Include prior knowledge and maintenance; use narrowly bounded successor probes, not automatic curriculum acceleration.

## Initial usable scope

The first working release focuses on arithmetic facts and mental computation: addition, subtraction, multiplication/division through fact families, missing operands, repeated mistakes, manual drills and short daily practice. It supports multiple children, persistence, basic parent reports, and a transparent mastery/scheduling model. Fractions, decimals, measurement/conversions and visual interactions are subsequent renderers/generators, not a different engine.

## Evidence vocabulary

Activities are `PRACTICE`, `DIAGNOSTIC`, `PLACEMENT`, `MASTERY_CHECK`, `REVIEW`, `TEST`, or `PROBE`. A session score is a performance summary, not mastery. Human-facing derived states are `NEW`, `LEARNING`, `FLUENT`, and `AUTOMATIC`; they can regress after adverse recent/retention evidence.

## Privacy and safety baseline

The household owns its local data. Store only what is necessary (a child display name/pseudonym and learning evidence); no analytics SDK, advertising, external child-data transmission, or mandatory identity provider. Parent controls should be local and simple, with explicit threat assumptions documented in deployment material. Backups/export must be portable.

## Non-goals

No complete MOE coverage claim, leaderboard, sibling comparison, cloud dependence, opaque “AI chose this” engine, or high-stakes diagnostic claim. Curriculum mapping reports fluency-core/supporting coverage and reference-only objectives separately.
