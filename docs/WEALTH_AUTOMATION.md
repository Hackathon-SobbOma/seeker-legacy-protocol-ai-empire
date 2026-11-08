# Wealth-system automation

The combined repository now includes an ethical, approval-gated automation control plane in `seekermoneygene/src/automation.ts`.

## What it automates

Each cycle can produce:

- audience research tasks;
- disclosure-first content drafts from one source idea;
- a validated value-first offer draft;
- analytics and learning tasks;
- channel-specific publish tasks for X, LinkedIn, YouTube, and newsletters.

## What it does not do

The engine does not promise income, fabricate earnings, buy ads, send spam, trade assets, sign wallets, process payments, or publish unattended. Social publishing tasks require human approval when `requireHumanApproval` is enabled. Posting is capped at 20 planned posts per day, and a zero limit blocks publishing.

The current implementation is provider-neutral. A future adapter may implement a platform API only after its credentials, account allowlist, disclosure rules, rate limits, consent policy, and approval workflow are configured. Secrets must be managed through the connector or application secret store, never committed to the repository.

## Commands

```bash
pnpm demo:automation
pnpm test:automation
```

The demo creates the plan, shows the safety controls, and approves one X draft only. It leaves the other publish tasks gated.
