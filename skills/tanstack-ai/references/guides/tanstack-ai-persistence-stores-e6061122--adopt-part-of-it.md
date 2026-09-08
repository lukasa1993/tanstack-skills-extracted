# Stores — Adopt part of it

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Adopt part of it

You rarely need all four stores in the same system. Implement the ones you own
and fill the rest from another base with `composePersistence`:

```ts
import { composePersistence, memoryPersistence } from '@tanstack/ai-persistence'
import { messages, runs } from './my-postgres-stores'

export const persistence = composePersistence(memoryPersistence(), {
  overrides: { messages, runs },
})
```

Only listed keys move; others stay on the base. Pass `false` to drop a store.
There is **no cross-store transaction** — if `messages` lives in Postgres and
`interrupts` in Redis, a write touching both is two writes. The store
invariants (idempotent `createOrResume`, insert-if-absent `create`) are exactly
what make those retries safe.

`composePersistence` accepts the four state keys. Locks and sandbox instance
maps are not composable here.
