# Research decisions for Math Drill

Research was decision-oriented and retrieved 2026-09-18. Links are deliberately primary/official where available. These findings guide a small household product; they do not make it a psychometric instrument.

## MOE curriculum and assessment

**What established sources say.** The [MOE 2021 Primary Mathematics Syllabus, Dec 2024 update](https://www.moe.gov.sg/-/media/files/primary/2021-primary-mathematics-syllabus-p1-to-p6-updated-dec-2024.pdf) provides a cumulative P1–P6 programme, three strands, and a framework centred on mathematical problem solving. It describes formative/diagnostic assessment as assessment for learning and summative assessment as measuring learning.

**Decision.** Preserve official versioned hierarchy and wording separately from internal skills; report only what Math Drill assesses. Evidence activities are tagged by purpose, but no product result is an MOE score or diagnosis.

## Fluency and automaticity

**What established sources say.** The [US National Mathematics Advisory Panel report](https://www.ed.gov/media/document/final-reportpdf-89275.pdf) treats conceptual understanding, computational fluency and problem solving as mutually reinforcing; it describes practice as supporting automaticity—fast, accurate, effortless processing that frees working memory.

**Relevant / unnecessary.** This supports focused fact/procedure retrieval after instruction, not timed-speed-only teaching or equating quickness with understanding.

**Decision.** Model accuracy, latency, consistency, spacing and retention. Apply latency policies per skill; preserve low-speed but correct multi-step evidence without universal time cut-offs.

## Knowledge tracing, PFA and IRT

**What established systems do.** Classic Bayesian Knowledge Tracing models evolving knowledge state per skill. Performance Factors Analysis uses prior successes/failures as factors; [Gong, Beck & Heffernan (2011)](https://journals.sagepub.com/doi/pdf/10.3233/JAI-2011-016) found PFA can predict individual practice opportunities better than KT in their comparison. IRT models the relation of person ability and item response; calibrated IRT supports efficient CAT and common scales ([Weiss, 1987](https://iaap-journals.onlinelibrary.wiley.com/doi/abs/10.1111/j.1464-0597.tb01190.x)).

**Relevant / unnecessary.** These justify versioned evidence, multiple skill links, item features and future calibration. Household-scale uncalibrated data cannot justify a fitted latent-ability or high-precision psychometric score; opaque deep models are neither necessary nor explainable.

**Decision.** Ship deterministic `heuristic-v1` behind a `MasteryModel` interface. Keep immutable attempts, model/version/config identifiers, generated item features and question-to-skill weights so BKT/PFA/IRT-like models may be evaluated and replayed later. Label early difficulty estimates heuristic, never calibrated.

## Adaptive progression and difficulty

**What established systems do.** CAT chooses information-rich items around an estimated trait but requires an item bank with calibrated parameters. In a fluency product, prerequisite dependencies and content balance matter as much as a single ability estimate.

**Decision.** Maintain per-skill/domain working frontiers. Use rolling, policy-specific evidence: strong repeated performance permits a narrow successor **probe**; repeated probe success advances a frontier; weak evidence targets components/prerequisites while retaining maintenance. A single miss does not demote unrelated skills. Initial challenge bands/configuration are explicit versioned heuristics (not scientific constants) and scheduler decisions have recorded reasons.

## Spaced retrieval and retention

**What established sources say.** The review by [Carpenter, Pan & Butler (2022)](https://doi.org/10.1038/s44159-022-00089-1) synthesises evidence that spacing and retrieval practice improve learning across domains; [Roediger & Karpicke](https://pubmed.ncbi.nlm.nih.gov/26151629/) review testing/retrieval effects in laboratory and education settings.

**Decision.** Schedule successful skills for increasingly spaced retrieval, with intervals configurable and capped; failed or assisted retrieval shortens the interval and can regress derived state. Schedule a deterministic mixture of weak/current, learning edge, due review, maintenance and bounded probes rather than treating a static fact list as mastered forever.

## Prerequisite graphs and error patterns

**What established systems do.** Educational domain models commonly represent knowledge components and dependencies; one response can involve multiple components. Error analysis can identify recurring observable patterns, but a response alone does not establish a child’s underlying misconception.

**Decision.** Use a typed directed skill graph and weighted question-skill mapping. Store `ErrorClassification` as optional, versioned, evidence-level pattern labels with matcher/version/confidence—not a permanent inference about understanding. Use repetition thresholds before parent-facing pattern language or prerequisite fallback.

## Assessment representation / QTI

**What established systems do.** [1EdTech QTI](https://www.1edtech.org/standards/qti/index) defines interoperable assessment test/section/item information models. Its item concept separates rendered content/interactions, response processing, outcomes, hints and accessibility alternatives.

**Relevant / unnecessary.** Its separation is valuable; implementing QTI XML/packaging/interchange is disproportionate for a local product.

**Decision.** Adopt the separation `abstract question definition → renderer/interaction → response → scorer → attempt/result`. Represent semantic math task, parameters/seed, expected/accepted response and scoring separately from React. Renderers declare accessibility and interaction capabilities. Do not claim QTI conformance.

## Accessibility for interactive questions

**What established sources say.** [WCAG 2.2](https://www.w3.org/TR/WCAG22/) requires keyboard operability without timing dependence where applicable, no keyboard traps, visible focus, sufficient non-text contrast and not using colour alone. WCAG 2.2 adds alternatives to dragging and a 24×24 CSS-pixel minimum pointer target (with defined exceptions); [W3C’s summary](https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/) explains focus-not-obscured and target-size requirements.

**Decision.** Target WCAG 2.2 AA pragmatically: keyboard-equivalent actions for critical interactions (including drag/drop), semantic labels/text alternatives for visual tasks, colour-plus-text/icon feedback, visible non-obscured focus, sensible target spacing, adjustable/non-punitive timing, and no orientation lock. Renderer contracts include keyboard strategy, accessible prompt/response name, and non-drag alternative; visual fluency is not exempt from basic semantics.

## Resulting implementation guardrails

1. Attempt events are append-only and contain enough context to replay scoring/mastery/scheduling.
2. Derived tables are cacheable/rebuildable and always carry algorithm/config versions.
3. Deterministic seed plus child state/config allows reproducible sessions, while timestamps remain recorded evidence.
4. Parent explanations cite factual selection factors, not an opaque AI verdict.
