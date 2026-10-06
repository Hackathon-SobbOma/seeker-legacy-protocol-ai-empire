# AI Empire Worker

A bounded, event-driven AI organization for the SEEKER LEGACY PROTOCOL project. The Worker coordinates specialist agents, persists shared memory, evaluates failures, and creates repair workers without pretending to be an always-on process.

## Local demo

From the repository root:

```bash
pnpm --dir ai-empire install --no-frozen-lockfile
pnpm --dir ai-empire test
pnpm --dir ai-empire demo
```

The demo visibly creates master/research/code/judge workers, forces a real assertion failure in the code worker, records the failure and lesson, creates a repair worker, and verifies the repaired result.

## Cloudflare deployment

Install Wrangler and authenticate through the official Cloudflare flow. The repository intentionally does not contain a token.

```bash
pnpm --dir ai-empire install --no-frozen-lockfile
pnpm --dir ai-empire exec wrangler login
pnpm --dir ai-empire exec wrangler secret put LLM_API_URL
pnpm --dir ai-empire exec wrangler secret put LLM_API_KEY
pnpm --dir ai-empire exec wrangler secret put LLM_MODEL
pnpm --dir ai-empire deploy
```

The cron trigger is configured for every 15 minutes. This is legitimate event-driven execution, not a claim of uninterrupted 24/7 activity. Cloudflare free-tier limits, account quotas, and provider policies remain in force.

## API

- `GET /health` — health and execution-mode check
- `GET /dashboard` — minimal live state dashboard
- `GET /api/state` — current Durable Object state
- `POST /api/run` with `{ "goal": "...", "demoFailure": true }` — run a bounded cycle
- `POST /api/llm-check` — provider check, only when secrets are configured

## Two-minute pitch

AI Empire is an AI that builds the team it needs. A Cloudflare Worker receives an event, plans the missing capabilities, and creates bounded research, code, and judge specialists. Their work is persisted in a Durable Object shared memory. When the code worker fails a test, the system records the failure, learns an operational lesson, creates a repair specialist, and reruns the invariant. GitHub Actions validates the system on a schedule for heavier work. The important distinction is honesty: the platform uses legitimate cron and workflow events, hard limits, and secret-managed providers instead of pretending to be a limitless autonomous process.
