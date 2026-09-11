# Collection Setup — Core Patterns

[Guide and prerequisites](./tanstack-db-core-collection-setup-883eba1c.md) · Published skill · `@tanstack/db@0.9.0`.

## Core Patterns

### Local-only collection for prototyping

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

### Schema with type transformations

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

### ElectricSQL with txid tracking

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

The returned `txid` tells the collection to hold optimistic state until Electric streams back that transaction. See the [Electric adapter reference](../assets/tanstack-db-core-collection-setup/references/electric-adapter.md) for the full dual-path pattern (schema + parser).
