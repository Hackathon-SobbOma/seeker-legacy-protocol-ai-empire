# Subscription Preview QA

The `/pricing` route was visually verified on Aug 13, 2026. The page rendered with the SEEKER LEGACY PROTOCOL brand, monthly/yearly toggle, and four seeded tiers: Explorer at $0/month, Operator at $29/month, Legion at $99/month, and Protocol at $299/month. The professional Legion tier is marked as the adopted tier. Navigation links to Dashboard and Wallet are visible. The first load briefly showed a blank viewport while the dev server refreshed, then rendered correctly after refresh; no browser console errors were reported.

The `/billing` route was also visually verified in an unauthenticated browser session. It renders a centered access gate titled “Sign in to view billing,” explains that subscription controls and invoices require authentication, and provides a Return home action. No runtime or console errors appeared.

A local Stripe webhook smoke test was run against `/api/stripe/webhook` using a signed `evt_test_` payload. The endpoint returned HTTP 200 with `{\"verified\":true}`, confirming raw-body registration and test-event verification behavior.
