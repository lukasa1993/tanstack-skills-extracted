# Stores — Common mistakes

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Common mistakes

### CRITICAL: Append-only `saveThread`

Breaks the authoritative-history contract.

### CRITICAL: `createOrResume` overwriting existing runs

Breaks safe resume / double-submit.

### CRITICAL: Interrupt `create` upserting to pending

Can resurrect a resolved approval.

### HIGH: Returning bare `AIPersistence` from the factory

`withPersistence` rejects it. Annotate a named shape.

### HIGH: `list*` without stable `requestedAt` order

Middleware and tests assume ascending order.

### HIGH: Skipping the testkit

Silent semantic drift shows up as stuck approvals or wiped history in prod.

### HIGH: `listReclaimable` cutoff off by one

The cutoff is inclusive (`detachedSince <= now - ttlMs`). Using a strict `<`
drops runs detached exactly at the boundary.

### HIGH: Treating `listReclaimable` as automatic reclamation

It is a query a caller runs, not something the package acts on by itself.
Nothing reaps a returned run for you.
