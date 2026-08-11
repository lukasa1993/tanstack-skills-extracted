# Mutations

Optimistic mutation and transaction patterns.

<a id="source-tanstack-db-core-mutations-optimistic"></a>

## Mutations Optimistic

Source: `tanstack-db-core-mutations-optimistic`.

## Mutations & Optimistic State

> **Depends on:** `db-core/collection-setup` -- you need a configured collection
> (with `getKey`, sync adapter, and optionally `onInsert`/`onUpdate`/`onDelete`
> handlers) before you can mutate.

TanStack DB mutations follow a unidirectional loop:
**optimistic mutation -> handler persists to backend -> sync back -> confirmed state**.
Optimistic state is applied in the current tick and dropped when the handler resolves.

---

### Setup -- Collection Write Operations

#### insert

```ts
// Single item
todoCollection.insert({
  id: crypto.randomUUID(),
  text: 'Buy groceries',
  completed: false,
})

// Multiple items
todoCollection.insert([
  { id: crypto.randomUUID(), text: 'Buy groceries', completed: false },
  { id: crypto.randomUUID(), text: 'Walk dog', completed: false },
])

// With metadata / non-optimistic
todoCollection.insert(item, { metadata: { source: 'import' } })
todoCollection.insert(item, { optimistic: false })
```

#### update (Immer-style draft proxy)

```ts
// Single item -- mutate the draft, do NOT reassign it
todoCollection.update(todo.id, (draft) => {
  draft.completed = true
  draft.completedAt = new Date()
})

// Multiple items
todoCollection.update([id1, id2], (drafts) => {
  drafts.forEach((d) => {
    d.completed = true
  })
})

// With metadata
todoCollection.update(
  todo.id,
  { metadata: { reason: 'user-edit' } },
  (draft) => {
    draft.text = 'Updated'
  },
)
```

#### delete

```ts
todoCollection.delete(todo.id)
todoCollection.delete([id1, id2])
todoCollection.delete(todo.id, { metadata: { reason: 'completed' } })
```

All three return a `Transaction` object. Use `tx.isPersisted.promise` to await
persistence or catch rollback errors.

---

### Core Patterns

#### 1. createOptimisticAction -- intent-based mutations

Use when the optimistic change is a _guess_ at how the server will transform
the data, or when you need to mutate multiple collections atomically.

```ts
import { createOptimisticAction } from '@tanstack/db'

const likePost = createOptimisticAction<string>({
  // MUST be synchronous -- applied in the current tick
  onMutate: (postId) => {
    postCollection.update(postId, (draft) => {
      draft.likeCount += 1
      draft.likedByMe = true
    })
  },
  mutationFn: async (postId, { transaction }) => {
    await api.posts.like(postId)
    // IMPORTANT: wait for server state to sync back before returning
    await postCollection.utils.refetch()
  },
})

// Returns a Transaction
const tx = likePost(postId)
await tx.isPersisted.promise
```

Multi-collection example:

```ts
const createProject = createOptimisticAction<{ name: string; ownerId: string }>(
  {
    onMutate: ({ name, ownerId }) => {
      projectCollection.insert({ id: crypto.randomUUID(), name, ownerId })
      userCollection.update(ownerId, (d) => {
        d.projectCount += 1
      })
    },
    mutationFn: async ({ name, ownerId }) => {
      await api.projects.create({ name, ownerId })
      await Promise.all([
        projectCollection.utils.refetch(),
        userCollection.utils.refetch(),
      ])
    },
  },
)
```

#### 2. createPacedMutations -- auto-save with debounce / throttle / queue

```ts
import { createPacedMutations, debounceStrategy } from '@tanstack/db'

const autoSaveNote = createPacedMutations<string>({
  onMutate: (text) => {
    noteCollection.update(noteId, (draft) => {
      draft.body = text
    })
  },
  mutationFn: async ({ transaction }) => {
    const mutation = transaction.mutations[0]
    await api.notes.update(mutation.key, mutation.changes)
    await noteCollection.utils.refetch()
  },
  strategy: debounceStrategy({ wait: 500 }),
})

// Each call resets the debounce timer; mutations merge into one transaction
autoSaveNote('Hello')
autoSaveNote('Hello, world') // only this version persists
```

Other strategies:

```ts
import { throttleStrategy, queueStrategy } from '@tanstack/db'

// Evenly spaced (sliders, scroll)
throttleStrategy({ wait: 200, leading: true, trailing: true })

// Sequential FIFO -- every mutation persisted in order
queueStrategy({ wait: 0, maxSize: 100 })
```

#### 3. createTransaction -- manual batching

```ts
import { createTransaction } from '@tanstack/db'

const tx = createTransaction({
  autoCommit: false, // wait for explicit commit()
  mutationFn: async ({ transaction }) => {
    await api.batchUpdate(transaction.mutations)
  },
})

tx.mutate(() => {
  todoCollection.update(id1, (d) => {
    d.status = 'reviewed'
  })
  todoCollection.update(id2, (d) => {
    d.status = 'reviewed'
  })
})

// User reviews... then commits or rolls back
await tx.commit()
// OR: tx.rollback()
```

Inside `tx.mutate(() => { ... })`, the transaction is pushed onto an ambient
stack. Any `collection.insert/update/delete` call joins the ambient transaction
automatically via `getActiveTransaction()`.

For mutations captured by a manual transaction, collection-level
`onInsert`/`onUpdate`/`onDelete` handlers are not invoked automatically. The
manual transaction's `mutationFn` is responsible for persisting
`transaction.mutations`. This makes `createTransaction({ autoCommit: false })`
a good fit for draft-style flows where local state updates immediately but the
server call waits for Save/Blur; call `tx.rollback()` to discard the optimistic
changes.

#### 4. Mutation handler with refetch (QueryCollection pattern)

```ts
const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: () => api.todos.getAll(),
    getKey: (t) => t.id,
    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) => api.todos.create(m.modified)),
      )
      // IMPORTANT: handler must not resolve until server state is synced back
      // QueryCollection auto-refetches after handler completes
    },
    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) =>
          api.todos.update(m.original.id, m.changes),
        ),
      )
    },
    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) => api.todos.delete(m.original.id)),
      )
    },
  }),
)
```

For ElectricCollection, return `{ txid }` instead of refetching:

```ts
onUpdate: async ({ transaction }) => {
  const txids = await Promise.all(
    transaction.mutations.map(async (m) => {
      const res = await api.todos.update(m.original.id, m.changes)
      return res.txid
    }),
  )
  return { txid: txids }
}
```

---

### Common Mistakes

#### CRITICAL: Passing an object to update() instead of a draft callback

```ts
// WRONG -- silently fails or throws
collection.update(id, { ...item, title: 'new' })

// CORRECT -- mutate the draft proxy
collection.update(id, (draft) => {
  draft.title = 'new'
})
```

#### CRITICAL: Hallucinating mutation API signatures

The most common AI-generated errors:

- Inventing handler signatures (e.g. `onMutate` on a collection config)
- Confusing `createOptimisticAction` with `createTransaction`
- Wrong PendingMutation property names (`mutation.data` does not exist --
  use `mutation.modified`, `mutation.changes`, `mutation.original`)
- Missing the ambient transaction pattern

Always reference the exact types in `references/transaction-api.md`.

#### CRITICAL: onMutate returning a Promise

`onMutate` in `createOptimisticAction` **must be synchronous**. Optimistic state
is applied in the current tick. Returning a Promise throws
`OnMutateMustBeSynchronousError`.

```ts
// WRONG
createOptimisticAction({
  onMutate: async (text) => {
    collection.insert({ id: await generateId(), text })
  },
  ...
})

// CORRECT
createOptimisticAction({
  onMutate: (text) => {
    collection.insert({ id: crypto.randomUUID(), text })
  },
  ...
})
```

#### CRITICAL: Mutations without handler or ambient transaction

Collection mutations require either:

1. An `onInsert`/`onUpdate`/`onDelete` handler on the collection, OR
2. An ambient transaction from `createTransaction`/`createOptimisticAction`

Without either, throws `MissingInsertHandlerError` (or the Update/Delete variant).

#### HIGH: Calling .mutate() after transaction is no longer pending

Transactions only accept new mutations while in `pending` state. Calling
`mutate()` after `commit()` or `rollback()` throws
`TransactionNotPendingMutateError`. Create a new transaction instead.

#### HIGH: Changing primary key via update

The update proxy detects key changes and throws `KeyUpdateNotAllowedError`.
Primary keys are immutable once set. If you need a different key, delete and
re-insert.

#### HIGH: Inserting item with duplicate key

If an item with the same key already exists (synced or optimistic), throws
`DuplicateKeyError`. Always generate a unique key (e.g. `crypto.randomUUID()`)
or check before inserting.

#### HIGH: Not awaiting refetch after mutation in query collection handler

The optimistic state is held only until the handler resolves. If the handler
returns before server state has synced back, optimistic state is dropped and
users see a flash of missing data.

```ts
// WRONG -- optimistic state dropped before new server state arrives
onInsert: async ({ transaction }) => {
  await api.createTodo(transaction.mutations[0].modified)
  // missing: await collection.utils.refetch()
}

// CORRECT
onInsert: async ({ transaction }) => {
  await api.createTodo(transaction.mutations[0].modified)
  await collection.utils.refetch()
}
```

---

### Tension: Optimistic Speed vs. Data Consistency

Instant optimistic updates create a window where client state diverges from
server state. If the handler fails, the rollback removes the optimistic state --
which can discard user work the user thought was saved. Consider:

- Showing pending/saving indicators so users know state is unconfirmed
- Using `{ optimistic: false }` for destructive operations
- Designing idempotent server endpoints so retries are safe
- Handling `tx.isPersisted.promise` rejection to surface errors to the user

---

### References

- [Transaction API Reference](./assets/tanstack-db-core-mutations-optimistic/references/transaction-api.md) -- createTransaction config,
  Transaction object, PendingMutation type, mutation merging rules, strategy types
- [TanStack DB Mutations Guide](https://tanstack.com/db/latest/docs/guides/mutations)

<a id="source-tanstack-db-playbook-tanstack-db-mutations"></a>

## Tanstack Db Mutations

Source: `tanstack-db-playbook-tanstack-db-mutations`.

## Mutations

TanStack DB mutations follow optimistic update → server persist → sync back flow. Changes appear instantly, then confirm or rollback based on server response.

### Common Patterns

#### Collection-Level Mutations

```tsx
// Insert
todoCollection.insert({
  id: crypto.randomUUID(),
  text: 'Buy groceries',
  completed: false,
})

// Insert multiple
todoCollection.insert([
  { id: '1', text: 'Task 1', completed: false },
  { id: '2', text: 'Task 2', completed: false },
])

// Update (Immer-style draft)
todoCollection.update(todoId, (draft) => {
  draft.completed = true
  draft.completedAt = new Date()
})

// Update multiple
todoCollection.update([id1, id2], (drafts) => {
  drafts.forEach((draft) => {
    draft.completed = true
  })
})

// Delete
todoCollection.delete(todoId)

// Delete multiple
todoCollection.delete([id1, id2])
```

#### Mutation Handlers

Define handlers when creating collections to persist mutations:

```tsx
const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: async () => api.todos.getAll(),
    getKey: (item) => item.id,

    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) => api.todos.create(m.modified)),
      )
    },

    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) =>
          api.todos.update(m.original.id, m.changes),
        ),
      )
    },

    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) => api.todos.delete(m.original.id)),
      )
    },
  }),
)
```

#### Custom Actions with createOptimisticAction

For intent-based mutations or multi-collection changes:

```tsx
import { createOptimisticAction } from '@tanstack/react-db'

const likePost = createOptimisticAction<string>({
  onMutate: (postId) => {
    // Optimistic update (guess at change)
    postCollection.update(postId, (draft) => {
      draft.likeCount += 1
      draft.likedByMe = true
    })
  },
  mutationFn: async (postId) => {
    // Send intent to server
    await api.posts.like(postId)
    // Wait for sync back
    await postCollection.utils.refetch()
  },
})

// Use it
likePost(postId)
```

#### Multi-Collection Actions

```tsx
const createProject = createOptimisticAction<{ name: string; ownerId: string }>(
  {
    onMutate: ({ name, ownerId }) => {
      const projectId = crypto.randomUUID()

      projectCollection.insert({
        id: projectId,
        name,
        ownerId,
        createdAt: new Date(),
      })

      userCollection.update(ownerId, (draft) => {
        draft.projectCount += 1
      })
    },
    mutationFn: async ({ name, ownerId }) => {
      await api.projects.create({ name, ownerId })
      await Promise.all([
        projectCollection.utils.refetch(),
        userCollection.utils.refetch(),
      ])
    },
  },
)
```

#### Manual Transactions

For batch mutations with explicit commit control:

```tsx
import { createTransaction } from '@tanstack/react-db'

const reviewTx = createTransaction({
  autoCommit: false, // Wait for explicit commit
  mutationFn: async ({ transaction }) => {
    await api.batchUpdate(transaction.mutations)
  },
})

// Accumulate changes
reviewTx.mutate(() => {
  todoCollection.update(id1, (d) => {
    d.status = 'reviewed'
  })
  todoCollection.update(id2, (d) => {
    d.status = 'reviewed'
  })
})

// User reviews changes...

// Add more changes
reviewTx.mutate(() => {
  todoCollection.update(id3, (d) => {
    d.status = 'reviewed'
  })
})

// Commit all at once
await reviewTx.commit()
// Or rollback
// reviewTx.rollback()
```

#### Paced Mutations (Debounce/Throttle/Queue)

```tsx
import {
  usePacedMutations,
  debounceStrategy,
  throttleStrategy,
  queueStrategy,
} from '@tanstack/react-db'

// Debounce: Wait for inactivity (auto-save forms)
const mutate = usePacedMutations<{ field: string; value: string }>({
  onMutate: ({ field, value }) => {
    formCollection.update(formId, (draft) => {
      draft[field] = value
    })
  },
  mutationFn: async ({ transaction }) => {
    await api.forms.save(transaction.mutations)
  },
  strategy: debounceStrategy({ wait: 500 }),
})

// Throttle: Minimum spacing (sliders)
const mutate = usePacedMutations<number>({
  onMutate: (volume) => {
    settingsCollection.update('volume', (d) => {
      d.value = volume
    })
  },
  mutationFn: async ({ transaction }) => {
    await api.settings.updateVolume(transaction.mutations)
  },
  strategy: throttleStrategy({ wait: 200, leading: true, trailing: true }),
})

// Queue: Sequential processing (file uploads)
const mutate = usePacedMutations<File>({
  onMutate: (file) => {
    uploadCollection.insert({
      id: crypto.randomUUID(),
      file,
      status: 'pending',
    })
  },
  mutationFn: async ({ transaction }) => {
    await api.files.upload(transaction.mutations[0].modified)
  },
  strategy: queueStrategy({ wait: 500 }),
})
```

#### Non-Optimistic Mutations

Wait for server confirmation before showing change:

```tsx
// Insert without optimistic update
const tx = todoCollection.insert(
  { id: '1', text: 'Server-validated', completed: false },
  { optimistic: false },
)

// Wait for persistence
try {
  await tx.isPersisted.promise
  navigate('/success')
} catch (error) {
  toast.error('Failed to create')
}
```

#### Mutation with Metadata

Annotate mutations for custom handler behavior:

```tsx
todoCollection.update(todoId, { metadata: { intent: 'complete' } }, (draft) => {
  draft.completed = true
})

// In handler
onUpdate: async ({ transaction }) => {
  const mutation = transaction.mutations[0]
  if (mutation.metadata?.intent === 'complete') {
    await api.todos.complete(mutation.original.id)
  } else {
    await api.todos.update(mutation.original.id, mutation.changes)
  }
}
```

#### Waiting for Persistence

```tsx
const tx = todoCollection.update(todoId, (draft) => {
  draft.completed = true
})

// Check state
console.log(tx.state) // 'pending' | 'persisting' | 'completed' | 'failed'

// Wait for completion
try {
  await tx.isPersisted.promise
  console.log('Saved!')
} catch (error) {
  console.log('Failed:', error)
}
```

#### Handling Temporary IDs

When server generates the real ID:

```tsx
// Option 1: Use client-generated UUIDs (recommended)
todoCollection.insert({
  id: crypto.randomUUID(), // Stable ID, no flicker
  text: 'New todo',
})

// Option 2: Wait for persistence before enabling delete
const tx = todoCollection.insert({ id: tempId, text: 'New todo' })
await tx.isPersisted.promise
// Now safe to delete with real ID
```

### Transaction Handler API

```tsx
interface OperationHandler {
  ({ transaction, collection }): Promise<any>
}

// transaction.mutations array:
interface PendingMutation {
  collection: Collection
  type: 'insert' | 'update' | 'delete'
  key: string | number
  original: TData // Original item (update/delete)
  modified: TData // New item (insert/update)
  changes: Partial<TData> // Only changed fields (update)
  metadata?: Record<string, unknown>
}
```

### Mutation Merging

Multiple mutations on same item within a transaction merge:

| Existing → New  | Result    | Description                    |
| --------------- | --------- | ------------------------------ |
| insert + update | `insert`  | Merged into single insert      |
| insert + delete | _removed_ | Cancel out                     |
| update + delete | `delete`  | Delete wins                    |
| update + update | `update`  | Changes merged, first original |

### Detailed References

| Reference                       | When to Use                                    |
| ------------------------------- | ---------------------------------------------- |
| `references/handlers.md`        | Handler patterns, collection-specific behavior |
| `references/transactions.md`    | Manual transactions, autoCommit, lifecycle     |
| `references/paced-mutations.md` | Debounce, throttle, queue strategies           |
| `references/error-handling.md`  | Rollback, retry patterns, error recovery       |
| `references/temporary-ids.md`   | Server-generated IDs, view key mapping         |

<a id="source-tanstack-db-skills-tanstack-db-mutations"></a>

Exact duplicate of `tanstack-db-playbook-tanstack-db-mutations`; use the preceding canonical content.
