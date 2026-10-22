# Offline — Common Mistakes

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.1.4`.

## Common Mistakes

### CRITICAL Not passing idempotencyKey to the API

Wrong:

```ts
mutationFns: {
  createTodo: async ({ transaction }) => {
    await api.todos.create(transaction.mutations[0].modified)
  },
}
```

Correct:

```ts
mutationFns: {
  createTodo: async ({ transaction, idempotencyKey }) => {
    await api.todos.create({
      ...transaction.mutations[0].modified,
      idempotencyKey,
    })
  },
}
```

Offline transactions retry on failure. Without idempotency keys, retries can create duplicate records on the server.

### HIGH Not waiting for initialization

Wrong:

```ts
const executor = startOfflineExecutor({ ... })
const tx = executor.createOfflineTransaction({ mutationFnName: 'createTodo' })
```

Correct:

```ts
const executor = startOfflineExecutor({ ... })
await executor.waitForInit()
const tx = executor.createOfflineTransaction({ mutationFnName: 'createTodo' })
```

`startOfflineExecutor` initializes asynchronously (probes storage, requests leadership, replays outbox). Creating transactions before initialization completes may miss the leader election result and use the wrong code path.

### HIGH Missing collection in collections map

Wrong:

```ts
const executor = startOfflineExecutor({
  collections: {},
  mutationFns: { createTodo: ... },
})
```

Correct:

```ts
const executor = startOfflineExecutor({
  collections: { todos: todoCollection },
  mutationFns: { createTodo: ... },
})
```

The `collections` map is used to restore optimistic state from the outbox on page reload. Without it, previously pending mutations won't show their optimistic state while being replayed.

### MEDIUM Not handling NonRetriableError for permanent failures

Wrong:

```ts
mutationFns: {
  createTodo: async ({ transaction }) => {
    const res = await fetch('/api/todos', { ... })
    if (!res.ok) throw new Error('Failed')
  },
}
```

Correct:

```ts
class HttpError extends Error {
  constructor(readonly status: number) {
    super(`HTTP ${status}`)
    this.name = 'HttpError'
  }
}

mutationFns: {
  createTodo: async ({ transaction }) => {
    const res = await fetch('/api/todos', { ... })
    if (res.status === 422) {
      throw new NonRetriableError('Invalid todo')
    }
    if (res.status === 409) {
      throw new NonRetriableError('Duplicate detected')
    }
    // This todo API also treats these responses as permanent.
    if ([404, 405, 410].includes(res.status)) {
      throw new NonRetriableError(`Todo endpoint rejected: ${res.status}`)
    }
    if (!res.ok) throw new HttpError(res.status)
  },
}
```

Classify failures according to whether the app can recover. The default policy
stops when an error message contains 400, 401, 403, or 422; it can retry other
errors indefinitely. This example marks 404, 405, and 410 as permanent for the
todo API while leaving 408 and 429 available for retry. Use `shouldRetry` when
a 401 can recover after credentials refresh, and use `NonRetriableError` for
known permanent failures.

See also: ./tanstack-db-core-mutations-optimistic-9abd33bd.md#source-tanstack-db-core-mutations-optimistic — for the underlying mutation primitives.

See also: ./tanstack-db-core-collection-setup-883eba1c.md#source-tanstack-db-core-collection-setup — for setting up collections used with offline transactions.
