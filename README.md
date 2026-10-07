# SEEKER LEGACY PROTOCOL

SEEKER LEGACY PROTOCOL is a security-first autonomous Web3 operations platform that turns AI into a disciplined operating layer for trading, airdrop qualification, wallet automation, and agent-managed workflows. Instead of trusting a free-form model to act without checks, the system is structured around bounded agents, human approval gates, realtime analytics, subscription controls, and transparent execution limits.

Built for Web3 teams, operators, and AI-native businesses, SEEKER helps users deploy specialized agents that are accountable, explainable, and constrained by protocol-safe policies.

## Why this matters

The market is flooded with generic AI demos and unbounded automation agents. Most are either:

- too risky for real wallet or trading activity,
- too opaque to trust with user funds or execution privileges,
- or too loosely scoped to deliver durable business value.

SEEKER LEGACY PROTOCOL solves this by combining:

- bounded autonomous workers,
- role-based specialist agents,
- safe approval gates for actions with financial impact,
- subscription-based access management,
- product-grade analytics and dashboards,
- Web3 wallet and airdrop flows designed for compliance-aware automation.

## The core idea

We do not give one giant AI unrestricted authority.

We give the system a team.

A master planner identifies required skills, creates specialist workers, tracks memory, manages budgets, and enforces safety constraints. In the same way a real organization assigns architecture, research, security, testing, and operations roles, SEEKER composes a bounded AI empire that can reason, evaluate, and improve without uncontrolled side effects.

This is the foundation for:

- airdrop discovery and qualification,
- token and wallet monitoring,
- execution planning with policy controls,
- agent-generated insights with explicit review points,
- revenue-aware subscription packages.

## Product experience

### 1. Autonomous Web3 operations

Users can connect a wallet, monitor account health, review opportunities, and trigger agent workflows with clear guardrails. The UI is built to feel like a high-conviction operating system for onchain operations rather than a raw prompt playground.

### 2. Airdrop Ralph loop

One of the standout workflows is the Ralph Loop: an autonomous discovery and approval system for airdrop opportunities. It:

- scans eligible opportunities,
- ranks and filters them by value and risk,
- simulates the opportunity before action,
- queues tasks for human approval,
- executes only after explicit authorization.

This keeps automated discovery valuable without turning finance into an uncontrolled agentic gamble.

### 3. Bounded AI Empire

The `ai-empire` worker is a cloud-native, event-driven, bounded AI orchestration system. It creates specialist agents with constrained depth, budgets, and concurrent execution limits. It logs lessons, evaluates performance, and records memory so the system is transparent and auditable.

### 4. Subscription-based access control

The platform includes a real subscription model with plans, checkout flows, current-plan enforcement, usage tracking, and billing records. This allows operators to align usage intensity with value while keeping the platform commercially viable.

## Architecture overview

```text
┌───────────────────────────────────────────────────────────────┐
│                       Client / Frontend                       │
│  React + Vite + Tailwind + Solana wallet UI                 │
│  Dashboard, pricing, billing, airdrop controls, empire UI   │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ HTTPS / tRPC / REST
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                        Backend API                            │
│  Express server + tRPC routers                               │
│  auth, wallet, subscriptions, airdrop, empire                │
│  DB access via Drizzle + MySQL                                │
└───────────────────────────────┬───────────────────────────────┘
                                │
                                │ Event-driven worker / simulation
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                     AI Empire Worker                          │
│  Cloudflare Worker + Durable Object pattern                  │
│  plan → spawn → execute → test → evaluate → learn           │
│  bounded roles: master, researcher, architect, coder,       │
│  tester, security, judge                                     │
└───────────────────────────────────────────────────────────────┘
```

## Core system components

### Client

The frontend is a polished React application that exposes:

- landing experience and product story,
- dashboard and protocol control surfaces,
- wallet connection and authentication paths,
- pricing and billing flows,
- airdrop opportunity queue and approval screens,
- Empire Control Center.

### Backend

The server layer provides the application runtime and exposes structured routes for:

- wallet lifecycle and user session management,
- subscription billing and usage checks,
- airdrop workflow orchestration,
- empire planning and execution simulation,
- secure business logic with typed request validation.

### AI Empire

The nested `ai-empire` package focuses on a bounded autonomous system rather than open-ended execution. It demonstrates a realistic orchestrated team:

- Master agent coordinates goals and capabilities
- Researcher collects context
- Architect structures approach
- Coder produces implementation or solution artifacts
- Tester validates outcomes
- Security reviews risk and policy
- Judge evaluates results

All worker outputs are intentionally bounded and simulation-labeled, avoiding claims of unrestricted system autonomy.

## Security-first design principles

This is one of the strongest differentiators of the project.

- No arbitrary shell execution in the orchestration layer
- No private-key custody or direct wallet signing without approvals
- No external API calls from the orchestrator without explicit guardrails
- Bounded generation depth, agent count, concurrency, and runtime limits
- Access gated behind subscription and account ownership controls
- Audit-friendly memory and evaluation logs

This makes the project credible as a platform, not just a prototype demo.

## Tech stack

### Application stack

- TypeScript
- React 19
- Vite
- Express
- tRPC
- Drizzle ORM
- MySQL / database migrations
- Stripe
- Solana wallet ecosystem
- AI SDK / LLM integrations

### AI Empire stack

- Cloudflare Workers
- Durable Object state management
- TypeScript
- Vitest
- Wrangler

## Repository structure

```text
.
├── ai-empire/                  # bounded AI worker + cloud orchestration
├── client/                     # user-facing React app
├── server/                     # backend API and business logic
├── shared/                     # shared protocol types and utilities
├── drizzle/                    # schema + migrations
├── scripts/                    # helper scripts and demos
├── references/                 # documentation and AI SDK notes
├── patches/                    # dependency patches
├── package.json                # root workspace scripts
├── vite.config.ts              # app build config
├── vitest.config.ts            # test config
├── tsconfig.json               # TypeScript project config
├── components.json             # UI config
├── .github/                    # automation workflows
├── QA_SUBSCRIPTION_PREVIEW.md  # monetization and QA notes
├── todo.md                     # project backlog or planning notes
└── README.md                   # this file
```

## Quick start

### Install dependencies

```bash
pnpm install
```

### Run the main app

```bash
pnpm dev
```

### Run tests

```bash
pnpm test
```

### Run the AI Empire demo

```bash
pnpm --dir ai-empire install --no-frozen-lockfile
pnpm --dir ai-empire test
pnpm --dir ai-empire demo
```

## Environment setup

The main app expects common service secrets and runtime configuration, including:

```bash
JWT_SECRET=
DATABASE_URL=
STRIPE_SECRET_KEY=
OAUTH_SERVER_URL=
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

The Cloudflare AI Empire worker relies on runtime secrets instead of source-controlled tokens:

```bash
LLM_API_URL
LLM_API_KEY
LLM_MODEL
```

## Why this is a winning project

This repo stands out because it combines four things that product-internal AI demos usually miss:

1. Real product thinking
   - It is not just a prompt demo; it has dashboards, wallets, subscriptions, and business logic.

2. Operational discipline
   - It introduces bounded agents and strong runtime ceilings instead of untrusted autonomous action.

3. Credible Web3 positioning
   - It targets real-world flows like airdrops, wallets, and token-aware tooling.

4. Clear business value
   - It supports product pricing, usage limits, and revenue flow management.

## Launch narrative

SEEKER LEGACY PROTOCOL positions itself as the operating layer for AI-native Web3 execution: a system that gives users trustworthy autonomous workflows without turning the protocol into an uncontrolled black box. It bridges the gap between promising AI agent concepts and production-grade operational discipline.

## Roadmap

- expand the airdrop opportunity engine and portfolio intelligence,
- integrate richer wallet and chain analytics,
- connect live onchain data with risk scoring,
- broaden agent role specialization for execution, compliance, and ops,
- add policy-aware approval UX and detailed execution logs,
- make the AI Empire runtime configurable for multiple verticals beyond Web3.

## License

This project is currently configured with MIT licensing at the root package level.

## Contributing

Contributions are welcome that improve safety, user trust, operator control, and product quality. Ideal improvements focus on:

- stronger validation and guardrails,
- transparent telemetry and memory,
- better Web3 integrations,
- AI runtime reliability,
- product clarity and UX polish.

---

Built to feel like a serious protocol, not a toy demo.
