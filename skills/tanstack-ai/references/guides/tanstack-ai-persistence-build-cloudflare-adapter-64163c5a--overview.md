# Build Cloudflare Adapter — Overview

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

# Cloudflare Chat Persistence

The deliverable is **one file in the Worker** — `src/lib/chat-persistence.ts` —
exporting a factory that builds a `ChatPersistence` from the request's D1
binding, plus (when the app needs coordination) a Durable Object lock store.
Tables go into the app's existing `migrations/` directory and are applied with
`wrangler d1 migrations apply`.

Do not create a package or a migration runner. Wrangler already tracks applied
migrations; a second bookkeeping table only creates drift.

Read the **Store Reference**
(`docs/persistence/store-reference.md`) for the store contracts, and
**ai-persistence/stores** for the shape rules. This skill covers only
the Cloudflare-specific parts.
