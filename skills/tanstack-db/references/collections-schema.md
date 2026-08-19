# Collections and schemas

Collection setup, collection types, and schemas.

<a id="source-tanstack-db-core-collection-setup"></a>

## Collection Setup

Source: `tanstack-db-core-collection-setup`.

This skill builds on db-core. Read it first for the overall mental model.

## Collection Setup & Schema

### Setup

```ts
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { QueryClient } from '@tanstack/query-core'
import { z } from 'zod'

const queryClient = new QueryClient()

const todoSchema = z.object({
  id: z.number(),
  text: z.string(),
  completed: z.boolean().default(false),
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
})

const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: async (ctx) => {
      const res = await fetch('/api/todos', { signal: ctx.signal })
      return res.json()
    },
    queryClient,
    getKey: (item) => item.id,
    schema: todoSchema,
    onInsert: async ({ transaction }) => {
      await api.todos.create(transaction.mutations[0].modified)
    },
    onUpdate: async ({ transaction }) => {
      const mut = transaction.mutations[0]
      await api.todos.update(mut.key, mut.changes)
    },
    onDelete: async ({ transaction }) => {
      await api.todos.delete(transaction.mutations[0].key)
    },
  }),
)
```

### Choosing an Adapter

| Backend                          | Adapter                         | Package                             |
| -------------------------------- | ------------------------------- | ----------------------------------- |
| REST API / TanStack Query        | `queryCollectionOptions`        | `@tanstack/query-db-collection`     |
| ElectricSQL (real-time Postgres) | `electricCollectionOptions`     | `@tanstack/electric-db-collection`  |
| PowerSync (SQLite offline)       | `powerSyncCollectionOptions`    | `@tanstack/powersync-db-collection` |
| RxDB (reactive database)         | `rxdbCollectionOptions`         | `@tanstack/rxdb-db-collection`      |
| TrailBase (event streaming)      | `trailBaseCollectionOptions`    | `@tanstack/trailbase-db-collection` |
| No backend (UI state)            | `localOnlyCollectionOptions`    | `@tanstack/db`                      |
| Browser localStorage             | `localStorageCollectionOptions` | `@tanstack/db`                      |

If the user specifies a backend (e.g. Electric, PowerSync), use that adapter directly. Only use `localOnlyCollectionOptions` when there is no backend yet — the collection API is uniform, so swapping to a real adapter later only changes the options creator.

### Sync Modes

```ts
queryCollectionOptions({
  syncMode: 'eager', // default — loads all data upfront
  // syncMode: "on-demand", // loads only what live queries request
  // syncMode: "progressive", // (Electric only) query subset first, full sync in background
})
```

| Mode          | Best for                                                       | Data size |
| ------------- | -------------------------------------------------------------- | --------- |
| `eager`       | Mostly-static datasets                                         | <10k rows |
| `on-demand`   | Search, catalogs, large tables                                 | >50k rows |
| `progressive` | Collaborative apps needing instant first paint (Electric only) | Any       |

Calling `collection.preload()` on an on-demand collection is a no-op. Create
the live query for the required subset and call `liveQuery.preload()` instead.

For Query Collection request cancellation, cleanup boundaries, and shared
`QueryClient` behavior, read
[the Query adapter reference](./assets/tanstack-db-core-collection-setup/references/query-adapter.md#request-cancellation-and-cleanup).

### Indexing

Indexing is opt-in. The `autoIndex` option defaults to `"off"`. To enable automatic indexing, set `autoIndex: "eager"` and provide a `defaultIndexType`:

```ts
import { BasicIndex } from '@tanstack/db'

createCollection(
  queryCollectionOptions({
    autoIndex: 'eager',
    defaultIndexType: BasicIndex,
    // ...
  }),
)
```

Without `defaultIndexType`, setting `autoIndex: "eager"` throws a `CollectionConfigurationError`. You can also create indexes manually with `collection.createIndex()` and remove them with `collection.removeIndex()`.

### Core Patterns

#### Local-only collection for prototyping

```ts
import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'

const todoCollection = createCollection(
  localOnlyCollectionOptions({
    getKey: (item) => item.id,
    initialData: [{ id: 1, text: 'Learn TanStack DB', completed: false }],
  }),
)
```

#### Schema with type transformations

```ts
const schema = z.object({
  id: z.number(),
  title: z.string(),
  due_date: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
  priority: z.number().default(0),
})
```

Use `z.union([z.string(), z.date()])` for transformed fields — this ensures `TInput` is a superset of `TOutput` so that `update()` works correctly with the draft proxy.

#### ElectricSQL with txid tracking

Always use a schema with Electric — without one, the collection types as `Record<string, unknown>`.

```ts
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import { z } from 'zod'

const todoSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
  created_at: z.coerce.date(),
})

const todoCollection = createCollection(
  electricCollectionOptions({
    schema: todoSchema,
    shapeOptions: { url: '/api/electric/todos' },
    getKey: (item) => item.id,
    onInsert: async ({ transaction }) => {
      const res = await api.todos.create(transaction.mutations[0].modified)
      return { txid: res.txid }
    },
  }),
)
```

The returned `txid` tells the collection to hold optimistic state until Electric streams back that transaction. See the [Electric adapter reference](./assets/tanstack-db-core-collection-setup/references/electric-adapter.md) for the full dual-path pattern (schema + parser).

### Common Mistakes

#### CRITICAL queryFn returning empty array deletes all data

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

#### CRITICAL Not using the correct adapter for your backend

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

#### CRITICAL Electric txid queried outside mutation transaction

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

#### CRITICAL queryFn returning partial data without merging

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

#### HIGH Using async schema validation

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

#### HIGH getKey returning undefined for some items

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

#### HIGH TInput not a superset of TOutput with schema transforms

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

#### HIGH Runtime has no secure random number generator

TanStack DB's `safeRandomUUID()` uses `crypto.randomUUID()` when available and
falls back to `crypto.getRandomValues()`, including on non-secure HTTP origins.
Add a Web Crypto polyfill only in runtimes, including some React Native
versions, that provide neither API.

```ts
import { safeRandomUUID } from '@tanstack/db'

collection.insert({ id: safeRandomUUID(), text: 'New item' })
```

Source: packages/db/src/utils/uuid.ts, packages/db/tests/uuid.test.ts

#### MEDIUM Providing both explicit type parameter and schema

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

#### MEDIUM Direct writes overridden by next query sync

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

### References

- [TanStack Query adapter](./assets/tanstack-db-core-collection-setup/references/query-adapter.md)
- [ElectricSQL adapter](./assets/tanstack-db-core-collection-setup/references/electric-adapter.md)
- [PowerSync adapter](./assets/tanstack-db-core-collection-setup/references/powersync-adapter.md)
- [RxDB adapter](./assets/tanstack-db-core-collection-setup/references/rxdb-adapter.md)
- [TrailBase adapter](./assets/tanstack-db-core-collection-setup/references/trailbase-adapter.md)
- [Local adapters (local-only, localStorage)](./assets/tanstack-db-core-collection-setup/references/local-adapters.md)
- [Schema validation patterns](./assets/tanstack-db-core-collection-setup/references/schema-patterns.md)

See also: ./mutations.md#source-tanstack-db-core-mutations-optimistic — mutation handlers configured here execute during mutations.

See also: ./sync-persistence.md#source-tanstack-db-core-custom-adapter — for building your own adapter.

<a id="source-tanstack-db-playbook-tanstack-db-collections"></a>

## Tanstack Db Collections

Source: `tanstack-db-playbook-tanstack-db-collections`.

## Collections

Collections are typed data stores that decouple data loading from data binding. They can be populated from REST APIs, sync engines, or local storage, then queried uniformly with live queries.

### Collection Types

| Type                       | Package                             | Use Case                             |
| -------------------------- | ----------------------------------- | ------------------------------------ |
| **QueryCollection**        | `@tanstack/query-db-collection`     | REST APIs via TanStack Query         |
| **ElectricCollection**     | `@tanstack/electric-db-collection`  | Real-time Postgres sync via Electric |
| **PowerSyncCollection**    | `@tanstack/powersync-db-collection` | Offline-first with PowerSync         |
| **RxDBCollection**         | `@tanstack/rxdb-db-collection`      | RxDB local persistence               |
| **TrailBaseCollection**    | `@tanstack/trailbase-db-collection` | TrailBase real-time backend          |
| **LocalStorageCollection** | `@tanstack/db`                      | Browser localStorage persistence     |
| **LocalOnlyCollection**    | `@tanstack/db`                      | In-memory state (no persistence)     |

### Common Patterns

#### QueryCollection (REST APIs)

```tsx
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: async () => {
      const response = await fetch('/api/todos')
      return response.json()
    },
    getKey: (item) => item.id,
    schema: todoSchema, // Optional: Zod, Valibot, etc.

    onInsert: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) =>
          fetch('/api/todos', {
            method: 'POST',
            body: JSON.stringify(m.modified),
          }),
        ),
      )
    },

    onUpdate: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) =>
          fetch(`/api/todos/${m.original.id}`, {
            method: 'PUT',
            body: JSON.stringify(m.modified),
          }),
        ),
      )
    },

    onDelete: async ({ transaction }) => {
      await Promise.all(
        transaction.mutations.map((m) =>
          fetch(`/api/todos/${m.original.id}`, { method: 'DELETE' }),
        ),
      )
    },
  }),
)
```

#### Sync Modes

Control how data loads into collections:

```tsx
const productsCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['products'],
    queryFn: async (ctx) => {
      // Query predicates available in ctx.meta for on-demand mode
      const params = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions)
      return api.getProducts(params)
    },
    getKey: (item) => item.id,

    // Choose sync mode:
    syncMode: 'eager', // Default: Load all upfront (<10k rows)
    // syncMode: 'on-demand', // Load only what queries request (>50k rows)
    // syncMode: 'progressive', // Load subset first, sync full in background
  }),
)
```

| Mode          | Behavior                                   | Best For                                |
| ------------- | ------------------------------------------ | --------------------------------------- |
| `eager`       | Load entire collection upfront             | <10k rows, mostly static data           |
| `on-demand`   | Load only what queries request             | >50k rows, search interfaces, catalogs  |
| `progressive` | Load query subset, sync full in background | Collaborative apps, instant first paint |

#### ElectricCollection (Real-time Sync)

```tsx
import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'

const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    schema: todoSchema,
    getKey: (item) => item.id,

    shapeOptions: {
      url: '/api/todos', // Your Electric proxy
      params: { table: 'todos' },
    },

    onInsert: async ({ transaction }) => {
      const response = await api.todos.create(transaction.mutations[0].modified)
      return { txid: response.txid } // Return txid to wait for sync
    },

    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0]
      const response = await api.todos.update(original.id, changes)
      return { txid: response.txid }
    },
  }),
)
```

#### LocalStorageCollection

```tsx
import {
  createCollection,
  localStorageCollectionOptions,
} from '@tanstack/react-db'

const settingsCollection = createCollection(
  localStorageCollectionOptions({
    id: 'user-settings',
    storageKey: 'app-settings',
    getKey: (item) => item.id,
    schema: settingsSchema,
  }),
)

// Data persists across sessions and syncs across tabs
settingsCollection.insert({ id: 'theme', value: 'dark' })
```

#### LocalOnlyCollection

```tsx
import {
  createCollection,
  localOnlyCollectionOptions,
} from '@tanstack/react-db'

const uiStateCollection = createCollection(
  localOnlyCollectionOptions({
    id: 'ui-state',
    getKey: (item) => item.id,
  }),
)

// In-memory only, lost on refresh
uiStateCollection.insert({ id: 'sidebar', expanded: true })
```

#### Collection with Schema

```tsx
import { z } from 'zod'

const todoSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean().default(false),
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .default(() => new Date()),
})

const todoCollection = createCollection(
  queryCollectionOptions({
    schema: todoSchema, // Validates inserts/updates, transforms types
    queryKey: ['todos'],
    queryFn: async () => api.todos.getAll(),
    getKey: (item) => item.id,
  }),
)
```

#### Using TanStack Query Client

```tsx
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: async () => api.todos.getAll(),
    getKey: (item) => item.id,
    queryClient, // Use your existing query client
  }),
)
```

### Collection API

```tsx
// Read operations
collection.get(key) // Get item by key
collection.has(key) // Check if key exists
collection.toArray // Get all items as array
collection.size // Number of items

// Write operations (trigger handlers)
collection.insert(item) // Insert item(s)
collection.update(key, fn) // Update item(s) with draft function
collection.delete(key) // Delete item(s)

// Utilities (collection-specific)
collection.utils.refetch() // QueryCollection: refetch from API
collection.utils.awaitTxId() // ElectricCollection: wait for txid
collection.utils.awaitMatch() // ElectricCollection: wait for custom match
collection.utils.acceptMutations() // LocalCollection: accept in manual tx
```

### Configuration Options

```tsx
interface CollectionOptions {
  id?: string // Unique identifier
  getKey: (item) => Key // Extract unique key from item
  schema?: StandardSchema // Validation schema (Zod, Valibot, etc.)

  // Persistence handlers
  onInsert?: MutationFn
  onUpdate?: MutationFn
  onDelete?: MutationFn

  // QueryCollection specific
  queryKey?: QueryKey
  queryFn?: QueryFn
  queryClient?: QueryClient
  syncMode?: 'eager' | 'on-demand' | 'progressive'

  // ElectricCollection specific
  shapeOptions?: ShapeStreamOptions
}
```

### Detailed References

| Reference                           | When to Use                                      |
| ----------------------------------- | ------------------------------------------------ |
| `references/query-collection.md`    | REST API integration, predicate push-down, delta |
| `references/electric-collection.md` | Electric setup, txid matching, shapes            |
| `references/local-collections.md`   | LocalStorage, LocalOnly, cross-tab sync          |
| `references/sync-modes.md`          | Eager vs on-demand vs progressive tradeoffs      |
| `references/custom-collections.md`  | Building your own collection type                |

<a id="source-tanstack-db-playbook-tanstack-db-schemas"></a>

## Tanstack Db Schemas

Source: `tanstack-db-playbook-tanstack-db-schemas`.

## Schemas

TanStack DB uses schemas to validate and transform data during mutations. Schemas are optional but strongly recommended for type safety and data integrity.

### Supported Libraries

Any [StandardSchema](https://standardschema.dev) compatible library:

- [Zod](https://zod.dev)
- [Valibot](https://valibot.dev)
- [ArkType](https://arktype.io)
- [Effect Schema](https://effect.website/docs/schema/introduction/)

### Common Patterns

#### Basic Validation

```tsx
import { z } from 'zod'
import { createCollection } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

const todoSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Text is required'),
  completed: z.boolean(),
  priority: z.number().min(0).max(5),
})

const collection = createCollection(
  queryCollectionOptions({
    schema: todoSchema,
    queryKey: ['todos'],
    queryFn: async () => api.todos.getAll(),
    getKey: (item) => item.id,
  }),
)

// Invalid data throws SchemaValidationError
collection.insert({
  id: '1',
  text: '', // ❌ Too short
  completed: 'yes', // ❌ Wrong type
  priority: 10, // ❌ Out of range
})
```

#### Default Values

```tsx
const todoSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  completed: z.boolean().default(false),
  priority: z.number().default(0),
  tags: z.array(z.string()).default([]),
  created_at: z.date().default(() => new Date()),
})

// Defaults filled automatically
collection.insert({
  id: '1',
  text: 'Buy groceries',
  // completed defaults to false
  // priority defaults to 0
  // tags defaults to []
  // created_at defaults to now
})
```

#### Type Transformations

Transform input types to different output types:

```tsx
const eventSchema = z.object({
  id: z.string(),
  name: z.string(),
  // IMPORTANT: Accept both input AND output types
  start_time: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
})

// Insert with string (TInput)
collection.insert({
  id: '1',
  name: 'Conference',
  start_time: '2024-06-15T10:00:00Z', // String in
})

// Get returns Date (TOutput)
const event = collection.get('1')
console.log(event.start_time.getFullYear()) // Date out!
```

#### TInput vs TOutput (Critical Concept)

When transforming types, TInput MUST be a superset of TOutput for updates to work:

```tsx
// ❌ BAD: TInput only accepts string, but draft contains Date
const badSchema = z.object({
  created_at: z.string().transform((val) => new Date(val)),
})
// TInput:  { created_at: string }
// TOutput: { created_at: Date }
// Problem: collection.update() passes Date but schema expects string!

// ✅ GOOD: TInput accepts both string and Date
const goodSchema = z.object({
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
})
// TInput:  { created_at: string | Date }
// TOutput: { created_at: Date }
// Works: update draft.created_at is Date, which TInput accepts!
```

**Rule:** If you transform A → B, use `z.union([A, B])` as input.

#### Validation Patterns

```tsx
// String constraints
z.string().min(3, 'Too short')
z.string().max(100, 'Too long')
z.string().email('Invalid email')
z.string().url('Invalid URL')
z.string().regex(/^[a-z]+$/, 'Lowercase only')

// Number constraints
z.number().int('Must be whole number')
z.number().positive('Must be positive')
z.number().min(0).max(100)

// Enums
z.enum(['low', 'medium', 'high'])

// Optional and nullable
z.string().optional() // Can be omitted
z.string().nullable() // Can be null
z.string().optional().nullable() // Either

// Arrays
z.array(z.string()).min(1, 'At least one required')

// Custom validation
z.string().refine(
  (val) => /^[a-zA-Z0-9_]+$/.test(val),
  'Only letters, numbers, underscores',
)

// Cross-field validation
z.object({
  start: z.date(),
  end: z.date(),
}).refine((data) => data.end > data.start, 'End must be after start')
```

#### Error Handling

```tsx
import { SchemaValidationError } from '@tanstack/db'

try {
  collection.insert({
    id: '1',
    email: 'invalid',
    age: -5,
  })
} catch (error) {
  if (error instanceof SchemaValidationError) {
    console.log(error.type) // 'insert' or 'update'
    console.log(error.message) // 'Validation failed with 2 issues'
    console.log(error.issues) // Array of issues
    // [
    //   { path: ['email'], message: 'Invalid email' },
    //   { path: ['age'], message: 'Must be positive' }
    // ]
  }
}
```

#### React Form Example

```tsx
function TodoForm() {
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      todoCollection.insert({
        id: crypto.randomUUID(),
        text: e.currentTarget.text.value,
        priority: parseInt(e.currentTarget.priority.value),
      })
    } catch (error) {
      if (error instanceof SchemaValidationError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          const field = issue.path?.[0] || 'form'
          newErrors[field] = issue.message
        })
        setErrors(newErrors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="text" />
      {errors.text && <span className="error">{errors.text}</span>}

      <input name="priority" type="number" />
      {errors.priority && <span className="error">{errors.priority}</span>}

      <button type="submit">Add</button>
    </form>
  )
}
```

#### Schema with Computed Fields

```tsx
const productSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    base_price: z.number(),
    discount_percent: z.number().default(0),
  })
  .transform((data) => ({
    ...data,
    final_price: data.base_price * (1 - data.discount_percent / 100),
    display_price: `$${(data.base_price * (1 - data.discount_percent / 100)).toFixed(2)}`,
  }))

collection.insert({
  id: '1',
  name: 'Widget',
  base_price: 100,
  discount_percent: 10,
})

const product = collection.get('1')
console.log(product.final_price) // 90
console.log(product.display_price) // '$90.00'
```

#### Handlers Receive TOutput

Schema transforms happen BEFORE handlers run:

```tsx
const schema = z.object({
  id: z.string(),
  created_at: z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val)),
})

const collection = createCollection({
  schema,
  onInsert: async ({ transaction }) => {
    const item = transaction.mutations[0].modified
    // item.created_at is already a Date (TOutput)!

    // If API needs string, serialize it
    await api.create({
      ...item,
      created_at: item.created_at.toISOString(),
    })
  },
})
```

### Important Notes

- Schemas validate **client mutations only** (insert/update), not server data
- TypeScript types are inferred from schema automatically
- If you provide a schema, don't also pass explicit type parameter
- Keep transformations simple—they run synchronously on every mutation

### Detailed References

| Reference                       | When to Use                              |
| ------------------------------- | ---------------------------------------- |
| `references/validation.md`      | Comprehensive validation patterns        |
| `references/transformations.md` | Type transformations, computed fields    |
| `references/tinput-toutput.md`  | Deep dive on TInput/TOutput relationship |
| `references/error-handling.md`  | SchemaValidationError, form integration  |

<a id="source-tanstack-db-skills-tanstack-db-collections"></a>

Exact duplicate of `tanstack-db-playbook-tanstack-db-collections`; use the preceding canonical content.

<a id="source-tanstack-db-skills-tanstack-db-schemas"></a>

Exact duplicate of `tanstack-db-playbook-tanstack-db-schemas`; use the preceding canonical content.
