# Architecture

Math Drill is a boring local TypeScript monorepo: React/Vite is the child and parent UI, Fastify is the local API, and SQLite is the durable store. Docker runs one service with `/data` mounted. No core path makes a network call.

```text
React renderer → Fastify API → application services → SQLite
                         ↘ pure engine packages ↗
skill data → generator → abstract question → scorer → immutable attempt
                                           ↘ mastery / scheduler derived state
```

Packages must stay framework-independent: `drill-engine` owns abstract questions/scoring; `mastery-engine`, `adaptive-engine`, and `scheduler` consume attempt evidence. React never selects difficulty or decides correctness.

The server is the only writer of attempt records. Derived state can be rebuilt from attempts under a named algorithm/configuration version. API responses provide the selection explanation used by the parent UI.

## Local deployment

`docker compose up -d` serves the app on port 3000 and persists database/export data under `./data`. The intended threat model is a trusted household LAN/device: no account is required and there is no remote access or enterprise authentication claim. Use an authenticated network layer such as Tailscale before exposing it beyond that boundary.
