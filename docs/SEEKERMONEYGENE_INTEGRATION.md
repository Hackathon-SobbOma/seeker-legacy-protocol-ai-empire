# Seekermoneygene integration

`seekermoneygene/` is the merged SEEKER OMEGA package inside the SEEKER LEGACY PROTOCOL repository.

## Repository layout

- `seekermoneygene/src/core/` contains the ethical role cycle, in-process memory, and Omega coordinator.
- `seekermoneygene/src/engines/` contains content-pack and monetization-draft engines.
- `seekermoneygene/src/automation.ts` contains the approval-gated social/content/offer/analytics automation plan.
- `ai-empire/` contains the standalone bounded Cloudflare Worker orchestration package.
- `server/agents/` and `server/routers/` contain the existing Web3 application services.
- `client/` contains the SEEKER LEGACY PROTOCOL web interface.

## Commands

From the repository root:

```bash
pnpm demo:omega
pnpm test:omega
pnpm demo:automation
pnpm test:automation
pnpm demo:ai-empire
pnpm test
```

## Safety boundary

The Omega package is currently a local, deterministic business-orchestration prototype. Its actions are ethical drafts and approval-marked suggestions; it does not sign wallets, trade, claim airdrops, publish content, send messages, or process payments. The live AI Empire Worker remains bounded and simulation-first. Any future connection to LLMs, external APIs, wallets, or publishing systems must be explicit, secret-backed, allowlisted, rate-limited, and approval-gated.
