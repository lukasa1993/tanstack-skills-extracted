# Write Mutations And Invalidate Related Queries

<a id="source-tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../mutations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).
Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).

## Setup

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

## Core Patterns

### Update from mutation response

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

### Track related mutations

```ts
import { useMutationState } from '@tanstack/react-query'

export function usePendingTodoTitles() {
  return useMutationState<string>({
    filters: { mutationKey: ['addTodo'], status: 'pending' },
    select: (mutation) => mutation.state.variables as string,
  })
}
```

### Scope defaults by mutation key

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

queryClient.setMutationDefaults(['addTodo'], {
  mutationFn: async (title: string) => ({ id: Date.now(), title }),
})
```

## Common Mistakes

### HIGH Multiple mutate arguments

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

### HIGH Per-call callback after unmount

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

### HIGH Not awaiting invalidation

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
