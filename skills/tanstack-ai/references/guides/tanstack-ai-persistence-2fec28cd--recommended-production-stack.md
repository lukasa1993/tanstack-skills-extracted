# Ai Persistence — Recommended production stack

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## Recommended production stack

1. **Client:** `persistence: true` — server-authoritative, no client cache.
2. **Server:** `withPersistence(backend)` — messages + runs + interrupts.
3. **Route:** delivery durability if mid-stream reconnect matters.
4. **Optional:** `withLocks(distributedLockStore)` from `@tanstack/ai/locks` when other middleware needs multi-instance coordination (not part of the state bag).
