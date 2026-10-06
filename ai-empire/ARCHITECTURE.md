# AI Empire Architecture

## Runtime

The Cloudflare Worker is the lightweight edge entry point. HTTP requests expose health, state, run, and dashboard endpoints. A Cloudflare Cron Trigger invokes the same bounded cycle every 15 minutes. The system is event-driven; it does not claim a continuously running process or 24/7 execution between events.

The Durable Object `EmpireState` is the single-writer state boundary for the primary organization. It stores the current run, agent tree, retry count, budget usage, and shared memory. The core engine depends on a small `StateStore` interface, so tests use an in-memory store while production uses Durable Object storage.

## Lifecycle

`PLAN → SPAWN → EXECUTE → TEST → EVALUATE → LEARN → REPLAN → DONE`

The Agent Factory creates only known roles (`research`, `code`, `judge`, and `repair`) and records parent IDs and generations. A failed code worker writes a failure and lesson to shared memory, then the repair worker is spawned within the configured depth and count limits.

## Heavy work

GitHub Actions runs the deterministic tests and the truthful failure/repair demo on a schedule or manual dispatch. It is not used to pretend that a workflow is always running; each invocation is bounded by the workflow timeout.

## LLM adapter

The adapter calls an authorized provider only when `LLM_API_URL` and `LLM_API_KEY` are injected as Worker secrets. No key is stored in source, logs, the dashboard, or the repository. If no provider is configured, deterministic behavior remains available and is labeled as fallback behavior.
