# Math Drill

Math Drill is a local-first adaptive fluency trainer for children: short, repeatable practice that measures retrieval accuracy, speed where appropriate, consistency and retention. It is not a general mathematics tutoring platform.

## Run locally

Requires Node 23+ and pnpm.

```sh
pnpm install
pnpm dev
```

Open the Vite URL shown in the terminal. For a single local service with persisted data:

```sh
docker compose up -d
```

Open http://localhost:3000. SQLite state is kept in `./data` (ignored by Git). Back up that directory; raw child evidence is also available from `GET /api/v1/children/:childId/export`.

## Development

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

The implementation contract is in [`docs/PRODUCT.md`](docs/PRODUCT.md), with domain decisions in the remaining docs. Core educational logic is framework-independent under `packages/drill-engine`; React only renders and submits questions.

## Current usable scope

Multiple independent child profiles, deterministic arithmetic facts (including missing operands), daily placement/review/probe selection, SQLite-backed sessions and immutable attempts, and a compact parent snapshot. Fractions, decimals, measurement, richer mastery reporting, curriculum ingestion and CSV backup tooling remain planned extensions.
