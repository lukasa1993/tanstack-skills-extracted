# Build Drizzle Adapter — 5. Verify

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## 5. Verify

```ts
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-drizzle', () => chatPersistence, {
  skip: ['activities', 'generationRuns', 'artifacts', 'blobs'],
})
```

Point it at a throwaway database (`:memory:` SQLite, a scratch schema, PGlite)
that has the migration applied, and reset between runs. The suite covers
every store, so a chat adapter declares what it omits: the optional
`activities` store and the generation half. Drop an entry from `skip` once
you add that table. `skip` never accepts `'locks'`, which is not a
store.

If your recipe leaves `listByThread` or `listReclaimable` unimplemented,
declare it with `skipMethods`, for example
`{ skipMethods: ['runs.listByThread'] }`. An omitted method that is not declared
fails the suite instead of silently passing. Subagent support is optional: when
`listByParentRun` is absent, the subagent checks skip on their own and need no
entry.
