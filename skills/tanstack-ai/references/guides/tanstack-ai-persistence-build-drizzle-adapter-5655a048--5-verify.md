# Build Drizzle Adapter — 5. Verify

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 5. Verify

```ts
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-drizzle', () => chatPersistence, {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Point it at a throwaway database (`:memory:` SQLite, a scratch schema, PGlite)
that has the migration applied, and reset between runs. The suite covers all
seven stores, so a chat adapter declares the generation half it omits; drop the
`skip` once you add those tables. `skip` never accepts `'locks'`, which is not a
store.

If your recipe leaves an optional `runs` method
(`listByThread`/`listReclaimable`) unimplemented, declare it
with `skipMethods`, e.g. `{ skipMethods: ['runs.listByThread'] }`. An
omitted method that is not declared fails the suite instead of silently
passing.
