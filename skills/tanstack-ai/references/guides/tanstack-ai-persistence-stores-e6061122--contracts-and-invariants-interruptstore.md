# Stores — Contracts and invariants: `InterruptStore`

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Contracts and invariants: `InterruptStore`


```ts
interface InterruptStore {
  create(record: Omit<InterruptRecord, 'status' | 'resolvedAt'>): Promise<void>
  resolve(interruptId: string, response?: unknown): Promise<void>
  cancel(interruptId: string): Promise<void>
  get(interruptId: string): Promise<InterruptRecord | null>
  list(threadId: string): Promise<Array<InterruptRecord>>
  listPending(threadId: string): Promise<Array<InterruptRecord>>
  listByRun(runId: string): Promise<Array<InterruptRecord>>
  listPendingByRun(runId: string): Promise<Array<InterruptRecord>>
}
```

- `create` always births `'pending'`; **insert-if-absent** on `interruptId`
  (never clobber resolved back to pending).
- All `list*` ordered by `requestedAt` ascending.
- Requires a `runs` store when used with chat persistence.
