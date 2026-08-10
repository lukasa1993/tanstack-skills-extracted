---
name: tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8
description: "Use this when writing server state with useMutation, mutationFn, mutate, mutateAsync, mutationKey, useMutationState, invalidateQueries, setMutationDefaults, awaited invalidation, and mutation callbacks."
license: "MIT"
metadata:
  tanstack-library: "TanStack Query"
  tanstack-library-version: "5.101.0"
  tanstack-package: "@tanstack/query-intent"
  tanstack-package-version: "5.101.0"
  tanstack-requires: "[\"tanstack-query-intent-core-design-query-keys-and-options\",\"tanstack-query-intent-core-fetch-and-observe-queries\"]"
  tanstack-source-ref: "github:TanStack/query@bdfb2605d0c598a8446b612e715200829b035d49#packages/query-intent"
  tanstack-source-skill: "core/write-mutations-and-invalidate-related-queries"
  tanstack-sources: "[\"TanStack/query:docs/framework/react/guides/mutations.md\",\"TanStack/query:docs/framework/react/guides/query-invalidation.md\",\"TanStack/query:docs/framework/react/guides/invalidations-from-mutations.md\",\"TanStack/query:docs/framework/react/guides/updates-from-mutation-responses.md\",\"TanStack/query:docs/framework/react/reference/useMutation.md\",\"TanStack/query:docs/framework/react/reference/useMutationState.md\",\"TanStack/query:docs/reference/MutationCache.md\"]"
  tanstack-type: "core"
---

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
