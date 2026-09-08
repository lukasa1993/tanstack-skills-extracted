# Cancel Queries And Consume Abort Signals

<a id="source-tanstack-query-intent-core-cancel-queries-and-consume-a-19e3bf0b"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../mutations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).

## Setup

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo(todoId: string) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/todos/${todoId}`, { signal })
      return response.json() as Promise<{ id: string; title: string }>
    },
  })
}
```

## Core Patterns

### Cancel before optimistic writes

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export async function prepareTodoWrite() {
  await queryClient.cancelQueries({ queryKey: ['todos'] })
}
```

### Consume one signal across nested fetches

```ts
import { queryOptions } from '@tanstack/react-query'

export const todosWithDetailsOptions = queryOptions({
  queryKey: ['todos-with-details'],
  queryFn: async ({ signal }) => {
    const todos = await fetch('/api/todos', { signal }).then(
      (response) => response.json() as Promise<Array<{ id: string }>>,
    )
    return Promise.all(
      todos.map((todo) =>
        fetch(`/api/todos/${todo.id}`, { signal }).then((response) =>
          response.json(),
        ),
      ),
    )
  },
})
```

### Cancel by query key

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function cancelTodos() {
  return queryClient.cancelQueries({ queryKey: ['todos'] })
}
```

## Common Mistakes

### HIGH Ignoring AbortSignal

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async () => fetch(`/api/todos/${id}`).then((r) => r.json()),
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async ({ signal }) =>
      fetch(`/api/todos/${id}`, { signal }).then((r) => r.json()),
  })
}
```

TanStack Query provides an AbortSignal; the request is only cancelled if the query function consumes it.

Source: TanStack/query:docs/framework/react/guides/query-cancellation.md

### HIGH Assuming unmount cancels

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useReport() {
  return useQuery({
    queryKey: ['report'],
    queryFn: async () => fetch('/api/report').then((r) => r.json()),
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useReport() {
  return useQuery({
    queryKey: ['report'],
    queryFn: async ({ signal }) =>
      fetch('/api/report', { signal }).then((r) => r.json()),
  })
}
```

Unused queries can continue and populate cache unless the signal is consumed.

Source: TanStack/query:docs/framework/react/guides/query-cancellation.md

### HIGH Suspense cancellation expected

Wrong:

```ts
import { useSuspenseQuery } from '@tanstack/react-query'

export function useTodo(id: string) {
  return useSuspenseQuery({
    queryKey: ['todo', id],
    queryFn: async ({ signal }) =>
      fetch(`/api/todos/${id}`, { signal }).then((r) => r.json()),
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async ({ signal }) =>
      fetch(`/api/todos/${id}`, { signal }).then((r) => r.json()),
  })
}
```

Cancellation limitations apply to Suspense hooks; use non-suspense queries when cancellation behavior is required.

Source: TanStack/query:docs/framework/react/guides/query-cancellation.md
