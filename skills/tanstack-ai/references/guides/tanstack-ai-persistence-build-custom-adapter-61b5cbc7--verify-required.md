# Build Custom Adapter — Verify (required)

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Verify (required)

This matters more here than anywhere else: there is no reference driver to
compare against, so the testkit is the only thing standing between a subtle
idempotency bug and stuck approvals in production.

```ts
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-custom', () => chatPersistence, {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Point it at a throwaway database and reset between runs. The suite covers all
seven stores, so declare every intentional omission — a chat adapter skips the
generation half above, and adds e.g. `'metadata'` if it drops that too. `skip`
never accepts `'locks'`, which is not a store.

If your recipe leaves an optional `runs` method (`listByThread`/
`listReclaimable`) unimplemented, declare it separately with `skipMethods`, e.g.
`{ skipMethods: ['runs.listByThread'] }`. An omitted method that is not declared
fails the suite instead of silently passing. `findActiveRun` is **not** in that
set — it is required, so there is nothing to declare.
