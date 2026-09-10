# Stores — Conformance tests (required)

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Conformance tests (required)

```ts
import { runPersistenceConformance } from '@tanstack/ai-persistence/testkit'
import { myPersistence } from '../src/persistence'

runPersistenceConformance('my-backend', () => myPersistence())

// Declare intentional omissions. The suite covers all seven stores, so a
// chat-only backend skips the generation half:
// runPersistenceConformance('chat-only', () => p, {
//   skip: ['generationRuns', 'artifacts', 'blobs'],
// })
// `skip` never accepts 'locks' — locks are not a store.

// Declare an intentionally-unimplemented OPTIONAL RunStore method with
// skipMethods, so vitest reports it as a real SKIPPED case:
// runPersistenceConformance('my-backend', () => myPersistence(), {
//   skipMethods: ['runs.listByThread', 'runs.listReclaimable'],
// })
```

The testkit is the compatibility gate: round-trips, rich message shapes,
empty-thread `[]`, `createOrResume` idempotency, interrupt insert-if-absent,
list ordering, composite-key non-aliasing. A missing store that is not listed
in `skip` fails loudly.

`skip` accepts only `'messages' | 'runs' | 'interrupts' | 'metadata'`. **Do not
pass `'locks'`** — it is not a state store and the suite does not cover it.

**`skipMethods` (declare-or-fail for optional `RunStore` methods).** A backend
that omits an OPTIONAL `RunStore` method (`listByThread`, `listReclaimable` —
`findActiveRun` is required and cannot be declared away) must declare it in
`skipMethods` as `'runs.<method>'`, e.g.
`skipMethods: ['runs.listByThread', 'runs.listReclaimable']`. An omitted
method that is NOT declared throws with an actionable message instead of
silently reporting a pass; a declared one is reported as a SKIPPED vitest
case, never as a pass. A case that did not run must never be
indistinguishable from one that did. See
`examples/ts-react-chat/src/lib/sqlite-persistence.test.ts` for a worked
example: it declares `skipMethods: ['runs.listByThread']` only, keeping both
`findActiveRun` and `listReclaimable` under test.

Reference implementation: `memoryPersistence()` in `@tanstack/ai-persistence`.
