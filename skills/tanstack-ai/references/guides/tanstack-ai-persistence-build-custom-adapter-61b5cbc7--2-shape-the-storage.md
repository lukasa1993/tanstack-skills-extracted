# Build Custom Adapter — 2. Shape the storage

[Guide and prerequisites](./tanstack-ai-persistence-build-custom-adapter-61b5cbc7.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 2. Shape the storage

Four logical records. Whatever the engine, keep these keys — the store methods
look records up by exactly these:

| Record    | Key                | Fields                                                                                                                                    |
| --------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| thread    | `threadId`         | `messages` (array, full transcript)                                                                                                       |
| run       | `runId`            | `threadId`, `status`, `startedAt`, `finishedAt?`, `error?`, `usage?`, `sandboxKey?`, `detachedSince?`, `cancelRequested?`, `driverEpoch?` |
| interrupt | `interruptId`      | `runId`, `threadId`, `status`, `requestedAt`, `resolvedAt?`, `payload`, `response?`                                                       |
| metadata  | `(namespace, key)` | `value`                                                                                                                                   |

- Timestamps are **epoch milliseconds** (`number`) in records. Store them
  however the engine prefers and convert in the mapper.
- `(namespace, key)` is a **composite** key. Never join with a separator —
  `('a:b','c')` and `('a','b:c')` must stay distinct records, and the
  conformance suite checks it.
- Index `runs(threadId, status)`, `runs(threadId, startedAt)`, and
  `interrupts(threadId, requestedAt)` for the listing paths. If the backend
  implements `listReclaimable`, also index `runs(status, detachedSince)`; that
  is the query it runs.
- `run.error` is a structured `RunError` (`{ message: string, code?: string }`),
  not a bare string. `message` is the provider's prose; `code` is the stable,
  machine-branchable classification an operator filters and groups by. In a
  SQL-backed table, store it as two columns (`error`, `error_code`) rather than
  one JSON blob, moved together in `update` so a later code-less failure can
  never leave a stale `code` from an earlier one behind. `run.status` is one of
  `'running' | 'interrupted' | 'completed' | 'failed' | 'aborted'`;
  `'interrupted'` is a pause, not terminal, and only
  `'completed' | 'failed' | 'aborted'` are terminal.
- Extra app-owned columns are fine (a `userId`, audit columns) as long as they
  are nullable or defaulted. The stores never read columns they do not know
  about.
