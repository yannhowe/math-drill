# Mastery model

`heuristic-v1` is transparent, deterministic and deliberately not psychometrically calibrated. It uses attempts across sessions/days, accuracy, unaided success count, latency relative to each skill policy, recency and recent failures. States are `NEW`, `LEARNING`, `FLUENT`, `AUTOMATIC`; a successful item cannot jump directly to automatic, and a recent failure/review lapse can regress state.

Fact policies treat timely retrieval as meaningful; procedure policies use generous/no latency weighting. Hints, retries and revealed answers suppress positive evidence. Every calculation has a model ID and config version, and the `MasteryModel` interface permits replay by later BKT/PFA/IRT-derived implementations without historical migration.
