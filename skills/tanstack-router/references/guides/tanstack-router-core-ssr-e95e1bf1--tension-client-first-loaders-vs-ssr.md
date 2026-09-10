# Ssr — Tension: Client-First Loaders vs SSR

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.29`.

## Tension: Client-First Loaders vs SSR

TanStack Router loaders are client-first by design. When SSR is enabled, they run in both environments. This means:

- Browser APIs work by default (client-only) but break under SSR
- Database access does NOT belong in loaders (unlike Remix/Next) — use API routes
- For server-only data logic with SSR, use TanStack Start's server functions

See [router-core/data-loading](./tanstack-router-core-data-loading-9f5ce056.md#source-tanstack-router-core-data-loading) for loader fundamentals.
