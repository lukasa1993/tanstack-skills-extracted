# Offline — Setup

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.1.3`.

## Setup

```ts
import {
  startOfflineExecutor,
  IndexedDBAdapter,
} from '@tanstack/offline-transactions'
import { safeRandomUUID } from '@tanstack/db'
import { todoCollection } from './collections'

const executor = startOfflineExecutor({
  collections: { todos: todoCollection },
  mutationFns: {
    createTodo: async ({ transaction, idempotencyKey }) => {
      const mutation = transaction.mutations[0]
      await api.todos.create({
        ...mutation.modified,
        idempotencyKey,
      })
    },
    updateTodo: async ({ transaction, idempotencyKey }) => {
      const mutation = transaction.mutations[0]
      await api.todos.update(mutation.key, {
        ...mutation.changes,
        idempotencyKey,
      })
    },
  },
})

// Wait for initialization (storage probe, leader election, outbox replay)
await executor.waitForInit()
```
