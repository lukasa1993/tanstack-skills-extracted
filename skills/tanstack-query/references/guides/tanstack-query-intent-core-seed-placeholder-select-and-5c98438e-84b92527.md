# Seed Placeholder Select And Transform Data

<a id="source-tanstack-query-intent-core-seed-placeholder-select-and-5c98438e"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../data-shaping.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).
Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).

## Setup

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

## Core Patterns

### Seed detail data from a list

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

### Select the smallest shape

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

### Transform in the query function for cache-wide shape

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

## Common Mistakes

### HIGH initialData overwrite assumption

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

### HIGH v4 keepPreviousData option

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

### MEDIUM Throwing in select

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
