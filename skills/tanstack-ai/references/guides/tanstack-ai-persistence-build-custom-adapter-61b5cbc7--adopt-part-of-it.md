# Build Custom Adapter — Adopt part of it

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Adopt part of it

You rarely need all four stores at once. Implement what you own and fill the
rest from another base:

```ts
import { composePersistence, memoryPersistence } from '@tanstack/ai-persistence'
import { messages, runs } from './my-stores'

export const chatPersistence = composePersistence(memoryPersistence(), {
  overrides: { messages, runs },
})
```

Only listed keys move. There is **no cross-store transaction** — if `messages`
lives in Postgres and `interrupts` in Redis, a write touching both is two
writes. The idempotency invariants are exactly what make those retries safe.
