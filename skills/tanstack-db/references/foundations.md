# Foundations

DB architecture and meta-framework routing.

<a id="source-tanstack-db-core"></a>

## Db Core

Source: `tanstack-db-core`.

## TanStack DB — Core Concepts

TanStack DB is a reactive client-side data store. It loads data into typed
collections from any backend (REST APIs, sync engines, local storage), provides
sub-millisecond live queries via differential dataflow, and supports instant
optimistic mutations with automatic rollback.

Framework packages (`@tanstack/react-db`, `@tanstack/vue-db`, `@tanstack/svelte-db`,
`@tanstack/solid-db`) re-export everything from `@tanstack/db` plus framework-specific
hooks. In framework projects, import from the framework package directly.
`@tanstack/angular-db` is the exception -- import operators from `@tanstack/db` separately.

### Sub-Skills

| Need to...                                       | Read                                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| Create a collection, pick an adapter, add schema | ./collections-schema.md#source-tanstack-db-core-collection-setup                    |
| Query data with where, join, groupBy, select     | ./live-queries.md#source-tanstack-db-core-live-queries                        |
| Insert, update, delete with optimistic UI        | ./mutations.md#source-tanstack-db-core-mutations-optimistic                |
| Build a custom sync adapter                      | ./sync-persistence.md#source-tanstack-db-core-custom-adapter                      |
| Persist collections to SQLite (offline cache)    | ./sync-persistence.md#source-tanstack-db-core-persistence                         |
| Preload collections in route loaders             | ./foundations.md#source-tanstack-db-meta-framework                              |
| Add offline transaction queueing                 | ./sync-persistence.md#source-tanstack-offline-transactions-offline (in @tanstack/offline-transactions) |

For framework-specific hooks:

| Framework | Read                |
| --------- | ------------------- |
| React     | ./framework-react.md#source-tanstack-react-db   |
| Vue       | ./framework-vue.md#source-tanstack-vue-db     |
| Svelte    | ./framework-svelte.md#source-tanstack-svelte-db  |
| Solid     | ./framework-solid.md#source-tanstack-solid-db   |
| Angular   | ./framework-angular.md#source-tanstack-angular-db |

### Quick Decision Tree

- Setting up for the first time? → db-core/collection-setup
- Building queries on collection data? → db-core/live-queries
- Writing data / handling optimistic state? → db-core/mutations-optimistic
- Using React hooks? → react-db
- Preloading in route loaders (Start, Next, Remix)? → meta-framework
- Building an adapter for a new backend? → db-core/custom-adapter
- Persisting collections to SQLite? → db-core/persistence
- Need offline transaction persistence? → offline

### Version

Targets @tanstack/db v0.6.0.

<a id="source-tanstack-db-meta-framework"></a>

## Meta Framework

Source: `tanstack-db-meta-framework`.

This skill builds on db-core. Read it first for collection setup and query builder.

## TanStack DB — Meta-Framework Integration

### Setup

TanStack DB collections are **client-side only**. SSR is not implemented. Routes using TanStack DB **must disable SSR**. The setup pattern is:

1. Set `ssr: false` on the route
2. Call `collection.preload()` in the route loader
3. Use `useLiveQuery` in the component

### TanStack Start

#### Global SSR disable

```ts
// start.tsx
import { createStart } from '@tanstack/react-start'

export const startInstance = createStart(() => {
  return {
    defaultSsr: false,
  }
})
```

#### Per-route SSR disable + preload

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useLiveQuery } from '@tanstack/react-db'

export const Route = createFileRoute('/todos')({
  ssr: false,
  loader: async () => {
    await todoCollection.preload()
    return null
  },
  component: TodoPage,
})

function TodoPage() {
  const { data: todos } = useLiveQuery((q) => q.from({ todo: todoCollection }))
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  )
}
```

#### Multiple collection preloading

```tsx
export const Route = createFileRoute('/electric')({
  ssr: false,
  loader: async () => {
    await Promise.all([todoCollection.preload(), configCollection.preload()])
    return null
  },
  component: ElectricPage,
})
```

### Next.js (App Router)

#### Client component with preloading

```tsx
// app/todos/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useLiveQuery } from '@tanstack/react-db'

export default function TodoPage() {
  const { data: todos, isLoading } = useLiveQuery((q) =>
    q.from({ todo: todoCollection }),
  )

  if (isLoading) return <div>Loading...</div>
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  )
}
```

Next.js App Router components using TanStack DB must be client components (`'use client'`). There is no server-side preloading — collections sync on mount.

#### With route-level preloading (experimental)

```tsx
// app/todos/page.tsx
'use client'

import { useEffect } from 'react'
import { useLiveQuery } from '@tanstack/react-db'

// Trigger preload immediately when module is loaded
const preloadPromise = todoCollection.preload()

export default function TodoPage() {
  const { data: todos } = useLiveQuery((q) => q.from({ todo: todoCollection }))
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  )
}
```

### Remix

#### Client loader pattern

```tsx
// app/routes/todos.tsx
import { useLiveQuery } from '@tanstack/react-db'
import type { ClientLoaderFunctionArgs } from '@remix-run/react'

export const clientLoader = async ({ request }: ClientLoaderFunctionArgs) => {
  await todoCollection.preload()
  return null
}

// Prevent server loader from running
export const loader = () => null

export default function TodoPage() {
  const { data: todos } = useLiveQuery((q) => q.from({ todo: todoCollection }))
  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.text}</li>
      ))}
    </ul>
  )
}
```

### Nuxt

#### Client-only component

```vue
<!-- pages/todos.vue -->
<script setup lang="ts">
import { useLiveQuery } from '@tanstack/vue-db'

const { data: todos, isLoading } = useLiveQuery((q) =>
  q.from({ todo: todoCollection }),
)
</script>

<template>
  <ClientOnly>
    <div v-if="isLoading">Loading...</div>
    <ul v-else>
      <li v-for="todo in todos" :key="todo.id">{{ todo.text }}</li>
    </ul>
  </ClientOnly>
</template>
```

Wrap TanStack DB components in `<ClientOnly>` to prevent SSR.

### SvelteKit

#### Client-side only page

```svelte
<!-- src/routes/todos/+page.svelte -->
<script lang="ts">
  import { browser } from '$app/environment'
  import { useLiveQuery } from '@tanstack/svelte-db'

  const todosQuery = browser
    ? useLiveQuery((q) => q.from({ todo: todoCollection }))
    : null
</script>

{#if todosQuery}
  {#each todosQuery.data as todo (todo.id)}
    <li>{todo.text}</li>
  {/each}
{/if}
```

Or disable SSR for the route:

```ts
// src/routes/todos/+page.ts
export const ssr = false
```

### Core Patterns

#### What preload() does

`collection.preload()` starts the sync process and returns a promise that resolves when the collection reaches "ready" status. This means:

1. The sync function connects to the backend
2. Initial data is fetched and written to the collection
3. `markReady()` is called by the adapter
4. The promise resolves

Subsequent calls to `preload()` on an already-ready collection return immediately.

#### Collection module pattern

Define collections in a shared module, import in both loaders and components:

```ts
// lib/collections.ts
import { createCollection, queryCollectionOptions } from '@tanstack/react-db'

export const todoCollection = createCollection(
  queryCollectionOptions({ ... })
)
```

```tsx
// routes/todos.tsx — loader uses the same collection instance
import { todoCollection } from '../lib/collections'

export const Route = createFileRoute('/todos')({
  ssr: false,
  loader: async () => {
    await todoCollection.preload()
    return null
  },
  component: () => {
    const { data } = useLiveQuery((q) => q.from({ todo: todoCollection }))
    // ...
  },
})
```

### Server-Side Integration

This skill covers the **client-side** read path only (preloading, live queries). For server-side concerns:

- **Electric proxy route** (forwarding shape requests to Electric) — see the [Electric adapter reference](./assets/tanstack-db-core-collection-setup/references/electric-adapter.md)
- **Mutation endpoints** (`createServerFn` in TanStack Start, API routes in Next.js/Remix) — implement using your framework's server function pattern. See the Electric adapter reference for the txid handshake that mutations must return.

### Common Mistakes

#### CRITICAL Enabling SSR with TanStack DB

Wrong:

```tsx
export const Route = createFileRoute('/todos')({
  loader: async () => {
    await todoCollection.preload()
    return null
  },
})
```

Correct:

```tsx
export const Route = createFileRoute('/todos')({
  ssr: false,
  loader: async () => {
    await todoCollection.preload()
    return null
  },
})
```

TanStack DB collections are client-side only. Without `ssr: false`, the route loader runs on the server where collections cannot sync, causing hangs or errors.

Source: examples/react/todo/src/start.tsx

#### HIGH Forgetting to preload in route loader

Wrong:

```tsx
export const Route = createFileRoute('/todos')({
  ssr: false,
  component: TodoPage,
})
```

Correct:

```tsx
export const Route = createFileRoute('/todos')({
  ssr: false,
  loader: async () => {
    await todoCollection.preload()
    return null
  },
  component: TodoPage,
})
```

Without preloading, the collection starts syncing only when the component mounts, causing a loading flash. Preloading in the route loader starts sync during navigation, making data available immediately when the component renders.

#### MEDIUM Creating separate collection instances

Wrong:

```tsx
// routes/todos.tsx
const todoCollection = createCollection(queryCollectionOptions({ ... }))

export const Route = createFileRoute('/todos')({
  ssr: false,
  loader: async () => { await todoCollection.preload() },
  component: () => {
    const { data } = useLiveQuery((q) => q.from({ todo: todoCollection }))
  },
})
```

Correct:

```ts
// lib/collections.ts — single shared instance
export const todoCollection = createCollection(queryCollectionOptions({ ... }))
```

Collections are singletons. Creating multiple instances for the same data causes duplicate syncs, wasted bandwidth, and inconsistent state between components.

See also: ./framework-react.md#source-tanstack-react-db, ./framework-vue.md#source-tanstack-vue-db, ./framework-svelte.md#source-tanstack-svelte-db, ./framework-solid.md#source-tanstack-solid-db, ./framework-angular.md#source-tanstack-angular-db — for framework-specific hook usage.

See also: ./collections-schema.md#source-tanstack-db-core-collection-setup — for collection creation and adapter selection.

<a id="source-tanstack-db-playbook-tanstack-db"></a>

## Tanstack Db

Source: `tanstack-db-playbook-tanstack-db`.

## TanStack DB Skills

TanStack DB is the reactive client store for your API. It provides sub-millisecond live queries, instant optimistic updates, and seamless integration with REST APIs and sync engines like ElectricSQL.

### Routing Table

| Topic            | Directory       | When to Use                                                                                           |
| ---------------- | --------------- | ----------------------------------------------------------------------------------------------------- |
| **Live Queries** | `live-queries/` | Querying data: filters, joins, aggregations, groupBy, orderBy, subqueries, reactive updates           |
| **Mutations**    | `mutations/`    | Writing data: insert/update/delete, optimistic updates, transactions, paced mutations, error handling |
| **Collections**  | `collections/`  | Data sources: QueryCollection, ElectricCollection, local collections, sync modes, collection setup    |
| **Schemas**      | `schemas/`      | Validation: schema definition, TInput/TOutput types, transformations, defaults, error handling        |
| **Electric**     | `electric/`     | ElectricSQL integration: shapes, txid matching, real-time sync, proxy setup                           |

### Quick Detection

**Route to `live-queries/` when:**

- Building queries with `useLiveQuery` or `createLiveQueryCollection`
- Using `from`, `where`, `select`, `join`, `groupBy`, `orderBy`
- Working with aggregations (`count`, `sum`, `avg`, `min`, `max`)
- Joining data across multiple collections
- Creating derived/materialized views
- Performance questions about query updates

**Route to `mutations/` when:**

- Using `collection.insert()`, `collection.update()`, `collection.delete()`
- Creating custom actions with `createOptimisticAction`
- Working with transactions via `createTransaction`
- Implementing paced mutations (debounce, throttle, queue)
- Handling mutation errors or rollbacks
- Questions about optimistic state lifecycle

**Route to `collections/` when:**

- Setting up a new collection
- Choosing between QueryCollection, ElectricCollection, LocalStorage, etc.
- Configuring sync modes (eager, on-demand, progressive)
- Understanding collection lifecycle
- Loading data from APIs or sync engines

**Route to `schemas/` when:**

- Defining schemas with Zod, Valibot, or other StandardSchema libraries
- Understanding TInput vs TOutput types
- Transforming data (string to Date, etc.)
- Setting default values
- Handling validation errors

**Route to `electric/` when:**

- Setting up ElectricSQL integration
- Working with shapes and real-time sync
- Implementing txid matching for mutations
- Debugging sync issues
- Building an Electric proxy

### Core Concepts

```tsx
import { createCollection, useLiveQuery, eq } from '@tanstack/react-db'
import { queryCollectionOptions } from '@tanstack/query-db-collection'

// 1. Define a collection (data source)
const todoCollection = createCollection(
  queryCollectionOptions({
    queryKey: ['todos'],
    queryFn: async () => fetch('/api/todos').then((r) => r.json()),
    getKey: (item) => item.id,
    onUpdate: async ({ transaction }) => {
      await api.todos.update(
        transaction.mutations[0].original.id,
        transaction.mutations[0].changes,
      )
    },
  }),
)

// 2. Query with live queries (reactive, incremental updates)
function TodoList() {
  const { data: todos } = useLiveQuery((q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.completed, false))
      .orderBy(({ todo }) => todo.createdAt, 'desc'),
  )

  // 3. Mutate with optimistic updates
  const toggleTodo = (id: string) => {
    todoCollection.update(id, (draft) => {
      draft.completed = !draft.completed
    })
  }

  return (
    <ul>
      {todos?.map((todo) => (
        <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
          {todo.text}
        </li>
      ))}
    </ul>
  )
}
```

### Data Flow

TanStack DB extends unidirectional data flow beyond the client:

```
┌─────────────────────────────────────────────────────────────┐
│                     OPTIMISTIC LOOP (instant)               │
│  User Action → Optimistic State → UI Update                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     PERSISTENCE LOOP (async)                │
│  Mutation Handler → Server → Sync Back → Confirmed State    │
└─────────────────────────────────────────────────────────────┘
```

### Package Overview

| Package                            | Purpose                                 |
| ---------------------------------- | --------------------------------------- |
| `@tanstack/db`                     | Core: collections, queries, mutations   |
| `@tanstack/react-db`               | React hooks: useLiveQuery, etc.         |
| `@tanstack/query-db-collection`    | REST API integration via TanStack Query |
| `@tanstack/electric-db-collection` | ElectricSQL real-time sync              |
| `@tanstack/vue-db`                 | Vue adapter                             |
| `@tanstack/angular-db`             | Angular adapter                         |
| `@tanstack/svelte-db`              | Svelte adapter                          |
| `@tanstack/solid-db`               | Solid adapter                           |

<a id="source-tanstack-db-skills-tanstack-db"></a>

Exact duplicate of `tanstack-db-playbook-tanstack-db`; use the preceding canonical content.
