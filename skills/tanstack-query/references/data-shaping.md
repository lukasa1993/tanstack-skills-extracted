# Data shaping

Pagination, infinite queries, placeholders, selectors, and render efficiency.

<a id="source-tanstack-query-intent-core-paginate-and-build-infinite-queries"></a>

## Paginate And Build Infinite Queries

Source: `tanstack-query-intent-core-paginate-and-build-infinite-queries`.

### Setup

```ts
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useProjects(page: number) {
  return useQuery({
    queryKey: ['projects', page],
    queryFn: async () => ({ page, projects: [{ id: page }] }),
    placeholderData: keepPreviousData,
  })
}
```

### Core Patterns

#### Build an infinite query

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({
      nextCursor: pageParam + 1,
      items: [{ id: pageParam }],
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
```

#### Bound memory with maxPages

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useBoundedFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({
      nextCursor: pageParam + 1,
      items: [{ id: pageParam }],
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    maxPages: 5,
  })
}
```

#### Preserve infinite data shape

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

queryClient.setQueryData(['feed'], {
  pages: [{ items: [{ id: 1 }], nextCursor: 2 }],
  pageParams: [1],
})
```

### Common Mistakes

#### CRITICAL Missing initialPageParam

Wrong:

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async () => ({ items: [] }),
    getNextPageParam: () => 1,
  })
}
```

Correct:

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ items: [pageParam] }),
    initialPageParam: 0,
    getNextPageParam: () => 1,
  })
}
```

v5 requires an explicit initial page param so pageParams can be serialized and inferred.

Source: TanStack/query:docs/framework/react/guides/infinite-queries.md

#### HIGH Overlapping infinite fetches

Wrong:

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

export function Feed() {
  const query = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ nextCursor: pageParam + 1 }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextCursor,
  })
  return <button onClick={() => query.fetchNextPage()}>More</button>
}
```

Correct:

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

export function Feed() {
  const query = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ nextCursor: pageParam + 1 }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextCursor,
  })
  return (
    <button
      disabled={query.isFetchingNextPage}
      onClick={() => query.fetchNextPage()}
    >
      More
    </button>
  )
}
```

Only one ongoing fetch should update an infinite query cache at a time unless explicitly overridden.

Source: TanStack/query:docs/framework/react/guides/infinite-queries.md

#### HIGH Broken pages shape

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.setQueryData(['feed'], [{ id: 1 }])
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.setQueryData(['feed'], { pages: [[{ id: 1 }]], pageParams: [0] })
```

Infinite query data must keep `pages` and `pageParams`; refetches expect that shape.

Source: TanStack/query:docs/framework/react/guides/infinite-queries.md

<a id="source-tanstack-query-intent-core-seed-placeholder-select-and-5c98438e"></a>

## Seed Placeholder Select And Transform Data

Source: `tanstack-query-intent-core-seed-placeholder-select-and-5c98438e`.

### Setup

```ts
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function useProjects(page: number) {
  return useQuery({
    queryKey: ['projects', page],
    queryFn: async () => ({ page, items: [{ id: page }] }),
    placeholderData: keepPreviousData,
  })
}
```

### Core Patterns

#### Seed detail data from a list

```ts
import { QueryClient, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function useTodo(todoId: number) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: async () => ({ id: todoId, title: 'Fresh' }),
    initialData: () =>
      queryClient
        .getQueryData<Array<{ id: number; title: string }>>(['todos'])
        ?.find((todo) => todo.id === todoId),
  })
}
```

#### Select the smallest shape

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodoCount() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }, { id: 2 }],
    select: (todos) => todos.length,
  })
}
```

#### Transform in the query function for cache-wide shape

```ts
import { queryOptions } from '@tanstack/react-query'

export const todosOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: async () =>
    [{ id: 1, title: 'ship' }].map((todo) => ({
      ...todo,
      title: todo.title.toUpperCase(),
    })),
})
```

### Common Mistakes

#### HIGH initialData overwrite assumption

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo() {
  return useQuery({
    queryKey: ['todo', 1],
    queryFn: async () => ({ id: 1, title: 'Server' }),
    initialData: { id: 1, title: 'Always' },
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo() {
  return useQuery({
    queryKey: ['todo', 1],
    queryFn: async () => ({ id: 1, title: 'Server' }),
    placeholderData: { id: 1, title: 'Temporary' },
  })
}
```

`initialData` is persisted to cache as real data; placeholder data is observer-local.

Source: TanStack/query:docs/framework/react/guides/initial-query-data.md

#### HIGH v4 keepPreviousData option

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function usePage(page: number) {
  return useQuery({
    queryKey: ['page', page],
    queryFn: async () => ({ page }),
    keepPreviousData: true,
  })
}
```

Correct:

```ts
import { keepPreviousData, useQuery } from '@tanstack/react-query'

export function usePage(page: number) {
  return useQuery({
    queryKey: ['page', page],
    queryFn: async () => ({ page }),
    placeholderData: keepPreviousData,
  })
}
```

v5 replaced the `keepPreviousData` option with `placeholderData: keepPreviousData`.

Source: TanStack/query:docs/framework/react/guides/migrating-to-v5.md

#### MEDIUM Throwing in select

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useFirstTodo() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [] as Array<{ id: number }>,
    select: (todos) => todos[0].id,
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useFirstTodo() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [] as Array<{ id: number }>,
    select: (todos) => todos[0]?.id ?? null,
  })
}
```

`select` transforms successful data; it is not the right place to model fetch errors.

Source: TanStack/query:docs/framework/react/guides/render-optimizations.md

See also: `lifecycle/ssr-hydration-and-streaming` for SSR tradeoffs compared to hydration.

<a id="source-tanstack-query-intent-core-selectors-and-derived-state"></a>

## Selectors And Derived State

Source: `tanstack-query-intent-core-selectors-and-derived-state`.

### Core Patterns

Use `select` to subscribe a component to the data shape it actually needs while keeping the full response in the cache.

#### Select a stable slice

```tsx
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

const productOptions = (id: string) =>
  queryOptions({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  })

function ProductTitle({ id }: { id: string }) {
  const title = useSuspenseQuery({
    ...productOptions(id),
    select: (product) => product.title,
  })

  return <h1>{title.data}</h1>
}
```

#### Stabilize expensive selectors

```tsx
const selectAverageRating = (products: Array<Product>) =>
  expensiveAverage(products)

function ProductSummary({ filters }: { filters: ProductFilters }) {
  return useSuspenseQuery({
    ...productsOptions(filters),
    select: selectAverageRating,
  })
}
```

Use `React.useCallback` when the selector closes over component props. Move it outside the component when it has no dependencies.

#### Derive client state instead of syncing it

```tsx
const selectedUser = usersQuery.data?.find((user) => user.id === selectedUserId)
const visibleSelectedUserId = selectedUser ? selectedUserId : null
```

When server data changes, derived values update naturally during render.

### Common Mistakes

#### HIGH Syncing derived state through an effect

Wrong:

```tsx
React.useEffect(() => {
  if (!users?.some((user) => user.id === selectedUserId)) {
    setSelectedUserId(null)
  }
}, [users, selectedUserId])
```

Correct:

```tsx
const selectedUser = users?.find((user) => user.id === selectedUserId)
const visibleSelectedUserId = selectedUser ? selectedUserId : null
```

Prefer deriving client state from server state during render when no side effect is required.

Source: https://tkdodo.eu/blog/deriving-client-state-from-server-state

#### MEDIUM Inline expensive select reruns on unrelated renders

Wrong:

```tsx
useSuspenseQuery({
  ...productsOptions(filters),
  select: (data) => expensiveSuperTransformation(data),
})
```

Correct:

```tsx
const selectProducts = (data: Array<Product>) =>
  expensiveSuperTransformation(data)

useSuspenseQuery({
  ...productsOptions(filters),
  select: selectProducts,
})
```

TanStack Query reruns `select` when data changes or the selector function identity changes.

Source: https://tkdodo.eu/blog/react-query-selectors-supercharged

#### MEDIUM Using select to throw domain errors

Wrong:

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => {
    if (!todos.length) throw new Error('No todos')
    return todos
  },
})
```

Correct:

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    const todos = await fetchTodos()
    if (!todos.length) throw new Error('No todos')
    return todos
  },
})
```

`select` transforms successful data. Query errors belong in the query function.

Source: TanStack/query:docs/framework/react/guides/render-optimizations.md

<a id="source-tanstack-query-intent-framework-shape-data-and-render-e-feb144a6"></a>

## Shape Data And Render Efficiently

Source: `tanstack-query-intent-framework-shape-data-and-render-e-feb144a6`.

This skill builds on `core/fetch-and-observe-queries` and `core/seed-placeholder-select-and-transform-data`.

### Setup

```tsx
import { useQuery } from '@tanstack/react-query'

export function TodoCount() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }, { id: 2 }],
    select: (todos) => todos.length,
  })
  return <p>{data ?? 0}</p>
}
```

### Hooks and Components

#### Destructure only used result fields

```tsx
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const { data, isFetching } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return (
    <pre>
      {isFetching ? 'Refreshing ' : ''}
      {JSON.stringify(data ?? [])}
    </pre>
  )
}
```

#### Keep Vue query data immutable

```ts
import { ref } from 'vue'

export function editableTodo(todo: { id: number; title: string }) {
  return ref({ ...todo })
}
```

#### Use stable members in deps

```tsx
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

export function TodosEffect() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  React.useEffect(() => console.log(data?.length ?? 0), [data])
  return null
}
```

### Common Mistakes

#### MEDIUM Rest destructuring

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  const { data, ...rest } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return { data, rest }
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  const { data, isFetching, error } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return { data, isFetching, error }
}
```

Rest destructuring touches every tracked property and disables fine-grained render tracking.

Source: TanStack/query:docs/eslint/no-rest-destructuring.md

#### HIGH Query result in hook deps

Wrong:

```tsx
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  React.useEffect(() => console.log(query.data), [query])
  return null
}
```

Correct:

```tsx
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  React.useEffect(() => console.log(data), [data])
  return null
}
```

The top-level query result object is not referentially stable; destructured members are tracked.

Source: TanStack/query:docs/eslint/no-unstable-deps.md

#### HIGH Vue v-model mutates query result

Wrong:

```vue
<script setup lang="ts">
const todo = { id: 1, title: 'Ship' }
</script>
<template><input v-model="todo.title" /></template>
```

Correct:

```vue
<script setup lang="ts">
import { ref } from 'vue'
const editableTodo = ref({ id: 1, title: 'Ship' })
</script>
<template><input v-model="editableTodo.title" /></template>
```

Vue Query results are immutable; make a mutable copy for form state.

Source: TanStack/query:docs/framework/vue/reactivity.md

See also: `compositions/enforce-query-best-practices-with-eslint` for lint rules that protect render tracking.
