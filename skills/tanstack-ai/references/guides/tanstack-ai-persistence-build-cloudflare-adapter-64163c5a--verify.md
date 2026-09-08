# Build Cloudflare Adapter — Verify

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Verify

```ts ignore
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { env } from 'cloudflare:test'
import { chatPersistence } from '../src/lib/chat-persistence'

runPersistenceConformance('app-d1', () => chatPersistence(env.AI_STATE), {
  skip: ['generationRuns', 'artifacts', 'blobs'],
})
```

Run it against a Miniflare D1 binding with the migration applied, reset between
runs. All four state stores are provided; the suite also covers the three
generation stores, so a chat-only adapter declares them skipped (drop the `skip`
once you add the R2-backed set from
**ai-persistence/build-cloudflare-artifact-store**). `skip` never accepts
`'locks'`, which is not a store.

If your recipe leaves an optional `runs` method
(`listByThread`/`listReclaimable`) unimplemented, declare it
with `skipMethods`, e.g. `{ skipMethods: ['runs.listByThread'] }`. An
omitted method that is not declared fails the suite instead of silently
passing.

The lock store needs its **own** tests, because nothing in the conformance suite
touches it. Cover at minimum: two concurrent `withLock` calls on the same key
serialize; different keys do not block each other; a lease that expires aborts
the signal handed to the critical section; and a callback that throws still
releases the lock.
