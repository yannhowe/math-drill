# Curriculum and internal-skill schema contract

## Two independent layers

`CurriculumNode` preserves an authority’s hierarchy/wording; `Skill` is Math Drill’s granular, pedagogical and measurable decomposition. They are separate records connected by a many-to-many mapping. A curriculum objective can map to zero skills (`REFERENCE_ONLY`), one skill, or several; a skill can support multiple objectives/curricula.

```text
CurriculumSource → CurriculumVersion → CurriculumNode (tree)
                                      ↕ ObjectiveSkillMapping
                                Skill ← SkillRelation → Skill
                                      ↕ QuestionSkillMapping
                                  Generator / generated question
```

## Curriculum data shape

`CurriculumSource`: stable id, authority, title, canonical URL, licence/notes.

`CurriculumVersion`: source id, version label, published/updated/retrieved dates, document hash, applicability notes, ingestion status.

`CurriculumNode`: stable source-scoped id, version id, parent id, `kind` (`CURRICULUM`, `SCHOOL_LEVEL`, `STRAND`, `SUB_STRAND`, `TOPIC`, `OBJECTIVE`), ordinal, official label/text, source locator, pathway (`COMMON`, `STANDARD`, `FOUNDATION`, nullable), and active flag. Preserve source identifiers/text rather than normalising them into code.

`ObjectiveSkillMapping`: objective id, skill id, product classification (`FLUENCY_CORE`, `FLUENCY_SUPPORTING`, `REFERENCE_ONLY`), mapping rationale, coverage status (`PLANNED`, `IMPLEMENTED`, `NOT_ASSESSED`), optional weight. A `REFERENCE_ONLY` mapping must never inflate mastery reporting.

## Skill graph

`Skill` contains stable internal id, label, domain, evidence/mastery policy id, difficulty/progression metadata, enabled state and documentation—not school level as a difficulty field. `SkillRelation` is directed and has `relationType`:

- `PREREQUISITE`: source is required/supporting prior knowledge for target.
- `COMPONENT`: source is an assessable component of a compound target.
- `SUCCESSOR`: target is a bounded next progression candidate.
- `RELATED`: non-causal association for discovery/reporting; never drives demotion by itself.

Use graph validation: no self-edge, no duplicate typed edge, and no cycle among `PREREQUISITE` edges. A question can touch several skills through `QuestionSkillMapping` with `role` (`PRIMARY`, `COMPONENT`, `CONTEXT`) and a non-negative evidence weight. This prevents the false `question.skill_id` assumption and permits cautious component attribution.

## Invariants

- Curriculum position is selected from a child profile and source version; it is not a mastery score.
- Item difficulty is generated features/empirical calibration, never a curriculum-node ordinal.
- A child’s frontier and review state are per skill/domain and profile, never household-global.
- New curricula require data and mappings, not learning-engine rewrite.
- Version immutable source data; corrections create a new version or documented migration, preserving historical mappings used for attempts.
