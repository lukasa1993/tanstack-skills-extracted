# Build Prisma Adapter — 5. Verify

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 5. Verify

```ts ignore
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-prisma', () => chatPersistence, {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Point the client at a throwaway database with the migration applied (a scratch
SQLite file is enough) and reset it between runs. All four state stores are
provided; the suite also covers the three generation stores, so declare those as
skipped until you add them. `skip` never accepts `'locks'`, which is not a
store.

If your recipe leaves an optional `runs` method
(`listByThread`/`listReclaimable`) unimplemented, declare it
with `skipMethods`, e.g. `{ skipMethods: ['runs.listByThread'] }`. An
omitted method that is not declared fails the suite instead of silently
passing.
