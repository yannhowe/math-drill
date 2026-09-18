# Data model

SQLite records children, settings, sessions, append-only attempts, and replaceable derived skill state. Attempts include activity type, timestamps, latency, question snapshot and seed, skills, response/expected snapshot, score, retry/hint/reveal fields, item features, and scorer/mastery/scheduler algorithm versions. They are never updated or deleted by recalculation.

`skill_state` is a cache keyed by child/skill/model version with state, score, due time, successful retrieval count and explanation. `scheduler_state` is likewise per child/skill. A child owns independent curriculum position, frontier, preferences and evidence. Exports are raw JSON and practical CSV; a database copy is a backup.

No schema uses `question.skill_id`: skill evidence is saved as a JSON list of role/weight references for the generated item, preserving multiple knowledge components even before a normalized reporting index is added.
