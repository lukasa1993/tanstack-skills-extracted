# Collection Setup — Common Mistakes

[Guide and prerequisites](./tanstack-db-core-collection-setup-883eba1c.md) · Published skill · `@tanstack/db@0.8.7`.

## Common Mistakes

### CRITICAL queryFn returning empty array deletes all data

Wrong:

```ts
queryCollectionOptions({
  queryFn: async () => {
    const res = await fetch('/api/todos?status=active')
    return res.json() // returns [] when no active todos — deletes everything
  },
})
```

Correct:

```ts
queryCollectionOptions({
  queryFn: async () => {
    const res = await fetch('/api/todos') // fetch complete state
    return res.json()
  },
  // Use on-demand mode + live query where() for filtering
  syncMode: 'on-demand',
})
```

In eager mode, `queryFn` is complete collection state. Returning `[]` means
"the server has no items" and removes all rows. In on-demand mode, a result is
complete only for that exact subset/Query key; an empty result releases that
subset's ownership, while overlapping subsets can keep shared rows.

Source: docs/collections/query-collection.md

### CRITICAL Not using the correct adapter for your backend

Wrong:

```ts
const todoCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (item) => item.id,
  }),
)
// Manually fetching and inserting...
```

Correct:

```ts
const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: async () => fetch('/api/todos').then((r) => r.json()),
    queryClient,
    getKey: (item) => item.id,
  }),
)
```

Each backend has a dedicated adapter that handles sync, mutation handlers, and utilities. Using `localOnlyCollectionOptions` or bare `createCollection` for a real backend bypasses all of this.

Source: docs/overview.md

### CRITICAL Electric txid queried outside mutation transaction

Wrong:

```ts
// Backend handler
app.post('/api/todos', async (req, res) => {
  const txid = await generateTxId(sql) // WRONG: separate transaction
  await sql`INSERT INTO todos ${sql(req.body)}`
  res.json({ txid })
})
```

Correct:

```ts
app.post('/api/todos', async (req, res) => {
  let txid
  await sql.begin(async (tx) => {
    txid = await generateTxId(tx) // CORRECT: same transaction
    await tx`INSERT INTO todos ${tx(req.body)}`
  })
  res.json({ txid })
})
```

`pg_current_xact_id()` must be queried inside the same SQL transaction as the mutation. Otherwise the txid doesn't match and `awaitTxId` times out (default 5 seconds).

Source: docs/collections/electric-collection.md

### CRITICAL queryFn returning partial data without merging

Wrong:

```ts
queryCollectionOptions({
  queryFn: async () => {
    const newItems = await fetch('/api/todos?since=' + lastSync)
    return newItems.json() // only new items — everything else deleted
  },
})
```

Correct:

```ts
queryCollectionOptions({
  queryFn: async (ctx) => {
    const existing = ctx.queryClient.getQueryData(['todos']) || []
    const newItems = await fetch('/api/todos?since=' + lastSync).then((r) =>
      r.json(),
    )
    return [...existing, ...newItems]
  },
})
```

An eager `queryFn` result replaces all collection data. For incremental eager
fetches, merge with existing data. In on-demand mode, return the complete state
for the requested subset instead.

Source: docs/collections/query-collection.md

### HIGH Using async schema validation

Wrong:

```ts
const schema = z.object({
  email: z.string().refine(async (val) => {
    const exists = await checkEmail(val)
    return !exists
  }),
})
```

Correct:

```ts
const schema = z.object({
  email: z.string().email(),
})
// Do async validation in the mutation handler instead
```

Schema validation must be synchronous. Async validation throws `SchemaMustBeSynchronousError` at mutation time.

Source: packages/db/src/collection/mutations.ts:101

### HIGH getKey returning undefined for some items

Wrong:

```ts
createCollection(
  queryCollectionOptions({
    getKey: (item) => item.metadata.id, // undefined if metadata missing
  }),
)
```

Correct:

```ts
createCollection(
  queryCollectionOptions({
    getKey: (item) => item.id, // always present
  }),
)
```

`getKey` must return a defined value for every item. Throws `UndefinedKeyError` otherwise.

Source: packages/db/src/collection/mutations.ts:148

### HIGH TInput not a superset of TOutput with schema transforms

Wrong:

```ts
const schema = z.object({
  created_at: z.string().transform((val) => new Date(val)),
})
// update() fails — draft.created_at is Date but schema only accepts string
```

Correct:

```ts
const schema = z.object({
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
})
```

When a schema transforms types, `TInput` must accept both the pre-transform and post-transform types for `update()` to work with the draft proxy.

Source: docs/guides/schemas.md

### HIGH Runtime has no secure random number generator

TanStack DB's `safeRandomUUID()` uses `crypto.randomUUID()` when available and
falls back to `crypto.getRandomValues()`, including on non-secure HTTP origins.
Add a Web Crypto polyfill only in runtimes, including some React Native
versions, that provide neither API.

```ts
import { safeRandomUUID } from '@tanstack/db'

collection.insert({ id: safeRandomUUID(), text: 'New item' })
```

Source: packages/db/src/utils/uuid.ts, packages/db/tests/uuid.test.ts

### MEDIUM Providing both explicit type parameter and schema

Wrong:

```ts
createCollection<Todo>(queryCollectionOptions({ schema: todoSchema, ... }))
```

Correct:

```ts
createCollection(queryCollectionOptions({ schema: todoSchema, ... }))
```

When a schema is provided, the collection infers types from it. An explicit generic creates conflicting type constraints.

Source: docs/overview.md

### MEDIUM Direct writes overridden by next query sync

Wrong:

```ts
todoCollection.utils.writeInsert(newItem)
// Next queryFn execution replaces all data, losing the direct write
```

Correct:

```ts
todoCollection.utils.writeInsert(newItem)
// Use staleTime to prevent immediate refetch
// Or return { refetch: false } from mutation handlers
```

Direct writes update the collection immediately, but the next `queryFn` returns complete server state which overwrites them.

Source: docs/collections/query-collection.md
