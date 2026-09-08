# Collection Setup — Setup

[Guide and prerequisites](./tanstack-db-core-collection-setup-883eba1c.md) · Published skill · `@tanstack/db@0.8.7`.

## Setup

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
