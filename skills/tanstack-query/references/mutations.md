# Mutations and cache updates

Mutations, invalidation, cancellation, and optimistic updates.

<a id="source-tanstack-query-intent-compositions-automatic-invalidati-a8e9b778"></a>

## Automatic Invalidation After Mutations

Source: `tanstack-query-intent-compositions-automatic-invalidati-a8e9b778`.

### Core Patterns

Use local mutation callbacks for one-off behavior. Use `MutationCache` callbacks when the app wants a consistent invalidation policy for every mutation.

#### Global invalidation after successful mutations

```ts
import { MutationCache, QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      return queryClient.invalidateQueries({
        queryKey: mutation.options.mutationKey,
      })
    },
  }),
})
```

If a mutation has `mutationKey: ['issues']`, this invalidates matching issue queries. If it has no mutation key, this becomes a broad invalidation policy, so only use that deliberately.

#### Use meta for explicit invalidation tags

```ts
import { matchQuery, MutationCache, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      return queryClient.invalidateQueries({
        predicate: (query) =>
          mutation.meta?.invalidates?.some((queryKey) =>
            matchQuery({ queryKey }, query),
          ) ?? true,
      })
    },
  }),
})
```

### Common Mistakes

#### HIGH Invalidating the whole app for every mutation

Wrong:

```ts
new MutationCache({
  onSuccess: () => queryClient.invalidateQueries(),
})
```

Correct:

```ts
new MutationCache({
  onSuccess: (_data, _variables, _context, mutation) =>
    queryClient.invalidateQueries({ queryKey: mutation.options.mutationKey }),
})
```

Global policies need scope. Reach for mutation keys or meta tags before invalidating everything.

Source: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations

#### HIGH Not returning invalidation when pending UI depends on refetch

Wrong:

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['todos'] })
}
```

Correct:

```ts
onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] })
```

Returning the promise keeps the mutation pending until the invalidation refetch completes.

Source: TanStack/query:docs/framework/react/guides/invalidations-from-mutations.md

#### MEDIUM Refetching data that should be static

Wrong:

```ts
useQuery({
  queryKey: ['build-info'],
  queryFn: fetchBuildInfo,
  staleTime: Infinity,
})
```

Correct:

```ts
useQuery({
  queryKey: ['build-info'],
  queryFn: fetchBuildInfo,
  staleTime: 'static',
})
```

If a query must not refetch even after broad manual invalidation, mark it with `staleTime: 'static'`.

Source: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations

<a id="source-tanstack-query-intent-core-cancel-queries-and-consume-a-19e3bf0b"></a>

## Cancel Queries And Consume Abort Signals

Source: `tanstack-query-intent-core-cancel-queries-and-consume-a-19e3bf0b`.

### Setup

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

### Core Patterns

#### Cancel before optimistic writes

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export async function prepareTodoWrite() {
  await queryClient.cancelQueries({ queryKey: ['todos'] })
}
```

#### Consume one signal across nested fetches

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

#### Cancel by query key

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function cancelTodos() {
  return queryClient.cancelQueries({ queryKey: ['todos'] })
}
```

### Common Mistakes

#### HIGH Ignoring AbortSignal

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

#### HIGH Assuming unmount cancels

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

#### HIGH Suspense cancellation expected

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

<a id="source-tanstack-query-intent-core-concurrent-optimistic-updates"></a>

## Concurrent Optimistic Updates

Source: `tanstack-query-intent-core-concurrent-optimistic-updates`.

### Core Patterns

Concurrent optimistic updates need per-mutation identity and scoped invalidation. A rollback or invalidation from one mutation should not erase another mutation that is still pending.

#### Scope related mutations

```tsx
const mutation = useMutation({
  mutationKey: ['items'],
  mutationFn: toggleItem,
  onMutate: async ({ id }) => {
    await queryClient.cancelQueries({ queryKey: ['items', 'detail', id] })
    const previousItem = queryClient.getQueryData<Item>(['items', 'detail', id])

    queryClient.setQueryData<Item>(['items', 'detail', id], (item) =>
      item ? { ...item, isActive: !item.isActive } : item,
    )

    return { previousItem }
  },
  onError: (_error, variables, context) => {
    queryClient.setQueryData(
      ['items', 'detail', variables.id],
      context?.previousItem,
    )
  },
  onSettled: () => {
    if (queryClient.isMutating({ mutationKey: ['items'] }) === 1) {
      return queryClient.invalidateQueries({ queryKey: ['items'] })
    }
  },
})
```

Use `queryClient.isMutating()` imperatively inside the callback so the count is current at the moment invalidation would run.

#### Render pending variables with stable keys

```tsx
const pendingAdds = useMutationState<string>({
  filters: { mutationKey: ['todos', 'add'], status: 'pending' },
  select: (mutation) =>
    `${mutation.state.submittedAt}:${mutation.state.variables}`,
})
```

`submittedAt` distinguishes multiple pending mutations with the same variables.

### Common Mistakes

#### CRITICAL One mutation invalidation reverts another optimistic update

Wrong:

```ts
onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] })
```

Correct:

```ts
onSettled: () => {
  if (queryClient.isMutating({ mutationKey: ['items'] }) === 1) {
    return queryClient.invalidateQueries({ queryKey: ['items'] })
  }
}
```

Skip intermediate invalidations while related optimistic mutations are still in flight.

Source: https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query

#### HIGH Optimistic list update ignores current filters

Wrong:

```ts
queryClient.setQueryData(['items', 'list', filters], (items) =>
  items?.map((item) => (item.id === updated.id ? updated : item)),
)
```

Correct:

```ts
queryClient.setQueryData(['items', 'list', filters], (items) =>
  items
    ?.map((item) => (item.id === updated.id ? updated : item))
    .filter((item) => matchesFilters(item, filters)),
)
```

If the server would remove the updated item from the filtered list, the optimistic cache update should do the same.

Source: https://tkdodo.eu/blog/concurrent-optimistic-updates-in-react-query

#### HIGH Pending optimistic rows share unstable keys

Wrong:

```tsx
{
  variables.map((title) => <li key={title}>{title}</li>)
}
```

Correct:

```tsx
const pending = useMutationState({
  filters: { mutationKey: ['todos', 'add'], status: 'pending' },
  select: (mutation) => ({
    variables: mutation.state.variables,
    submittedAt: mutation.state.submittedAt,
  }),
})

{
  pending.map((todo) => <li key={todo.submittedAt}>{todo.variables.title}</li>)
}
```

Use mutation metadata to keep concurrent optimistic rows distinct.

Source: TanStack/query:docs/framework/react/guides/optimistic-updates.md

<a id="source-tanstack-query-intent-core-implement-optimistic-updates-20e8c58a"></a>

## Implement Optimistic Updates And Cache Writes

Source: `tanstack-query-intent-core-implement-optimistic-updates-20e8c58a`.

### Setup

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

type Todo = { id: number; title: string }

export function useOptimisticAddTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => ({ id: Date.now(), title }),
    onMutate: async (title) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const previous = queryClient.getQueryData<Array<Todo>>(['todos'])
      queryClient.setQueryData<Array<Todo>>(['todos'], (old = []) => [
        ...old,
        { id: -1, title },
      ])
      return { previous }
    },
    onError: (_error, _title, context) => {
      queryClient.setQueryData(['todos'], context?.previous)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

### Core Patterns

#### Write mutation response into detail cache

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (todo: { id: number; title: string }) => todo,
    onSuccess: (todo) => queryClient.setQueryData(['todo', todo.id], todo),
  })
}
```

#### Update lists immutably

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

queryClient.setQueryData<Array<{ id: number; title: string }>>(
  ['todos'],
  (old = []) =>
    old.map((todo) => (todo.id === 1 ? { ...todo, title: 'Done' } : todo)),
)
```

#### Roll back with context

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
const previous = queryClient.getQueryData(['todos'])
queryClient.setQueryData(['todos'], [{ id: 1, title: 'Optimistic' }])
queryClient.setQueryData(['todos'], previous)
```

### Common Mistakes

#### CRITICAL Optimistic write without cancellation

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.setQueryData(['todos'], [{ id: 1, title: 'Optimistic' }])
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
await queryClient.cancelQueries({ queryKey: ['todos'] })
queryClient.setQueryData(['todos'], [{ id: 1, title: 'Optimistic' }])
```

An in-flight refetch can overwrite an optimistic write unless it is cancelled first.

Source: TanStack/query:docs/framework/react/guides/optimistic-updates.md

#### CRITICAL In-place mutation

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.setQueryData<Array<{ id: number; done: boolean }>>(
  ['todos'],
  (old = []) => {
    old[0].done = true
    return old
  },
)
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.setQueryData<Array<{ id: number; done: boolean }>>(
  ['todos'],
  (old = []) =>
    old.map((todo) => (todo.id === 1 ? { ...todo, done: true } : todo)),
)
```

Cache updates must be immutable so observers can detect and share changes correctly.

Source: TanStack/query:docs/framework/react/guides/updates-from-mutation-responses.md

#### HIGH Persisted persister loses optimistic mutation

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
queryClient.setMutationDefaults(['updateTodo'], {})
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
queryClient.setMutationDefaults(['updateTodo'], {
  mutationFn: async (todo: { id: number; title: string }) => todo,
})
```

Paused persisted mutations need a default mutationFn after hydration because functions cannot be serialized.

Source: TanStack/query:docs/framework/react/plugins/persistQueryClient.md

See also: `core/cancel-queries-and-consume-abort-signals` before optimistic writes.

<a id="source-tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8"></a>

## Write Mutations And Invalidate Related Queries

Source: `tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8`.

### Setup

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => ({ id: Date.now(), title }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })
}
```

### Core Patterns

#### Update from mutation response

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useSaveTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (todo: { id: string; title: string }) => todo,
    onSuccess: (todo) => {
      queryClient.setQueryData(['todo', todo.id], todo)
    },
  })
}
```

#### Track related mutations

```ts
import { useMutationState } from '@tanstack/react-query'

export function usePendingTodoTitles() {
  return useMutationState<string>({
    filters: { mutationKey: ['addTodo'], status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  })
}
```

#### Scope defaults by mutation key

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: async (title: string) => ({ id: Date.now(), title }),
})
```

### Common Mistakes

#### HIGH Multiple mutate arguments

Wrong:

```ts
import { useMutation } from '@tanstack/react-query'

export function useUpdateTodo() {
  return useMutation({
    mutationFn: async (input: { id: string; title: string }) => input,
  })
}

useUpdateTodo().mutate('1', 'Ship')
```

Correct:

```ts
import { useMutation } from '@tanstack/react-query'

export function useUpdateTodo() {
  return useMutation({
    mutationFn: async (input: { id: string; title: string }) => input,
  })
}

useUpdateTodo().mutate({ id: '1', title: 'Ship' })
```

Mutation variables are one value; pass an object when multiple fields are needed.

Source: TanStack/query:docs/framework/react/guides/mutations.md

#### HIGH Per-call callback after unmount

Wrong:

```ts
import { useMutation } from '@tanstack/react-query'

export function useSave() {
  return useMutation({ mutationFn: async (title: string) => title })
}

useSave().mutate('Ship', { onSuccess: () => console.log('saved') })
```

Correct:

```ts
import { useMutation } from '@tanstack/react-query'

export function useSave() {
  return useMutation({
    mutationFn: async (title: string) => title,
    onSuccess: () => console.log('saved'),
  })
}
```

Hook-level callbacks are tied to the mutation lifecycle; per-call callbacks may not run if the observer unmounts.

Source: TanStack/query:docs/framework/react/guides/mutations.md

#### HIGH Not awaiting invalidation

Wrong:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => title,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}
```

Correct:

```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useAddTodo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (title: string) => title,
    onSuccess: async () =>
      queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}
```

Returning the invalidation promise keeps the mutation pending until dependent data is refreshed.

Source: TanStack/query:docs/framework/react/guides/invalidations-from-mutations.md

See also: `core/implement-optimistic-updates-and-cache-writes` for mutation side effects that update the cache before the server returns.
