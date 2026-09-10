# Build Cloudflare Adapter — 2. Two independent pieces

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 2. Two independent pieces

```
D1 database      -> messages, runs, interrupts, metadata   (AIPersistence.stores)
Durable Object   -> LockStore                              (withLocks — NOT a store)
```

These do not compose into one object. `AIPersistence.stores` accepts exactly
four keys. Putting `locks` in the map throws
`Unknown AIPersistence store key: locks`; putting it in a `composePersistence`
override throws `Unknown AIPersistence override key: locks`. Both also fail to
type-check. Return
the state persistence from one factory and the lock store from another, then
wire them as two middlewares.

Most apps need only the first piece. Add the Durable Object when other
middleware genuinely needs mutual exclusion across isolates —
`InMemoryLockStore` gives none, because a Worker runs on many isolates at once.
