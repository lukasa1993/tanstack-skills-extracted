# Design Query Keys And Options

<a id="source-tanstack-query-intent-core-design-query-keys-and-options"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

## Setup

```ts
import { queryOptions } from '@tanstack/react-query'

export function todoOptions(todoId: string) {
  return queryOptions({
    queryKey: ['todo', todoId],
    queryFn: async () => ({ id: todoId, title: 'Ship skills' }),
    staleTime: 60_000,
  })
}
```

## Core Patterns

### Put every query variable in the key

```ts
import { queryOptions } from '@tanstack/react-query'

export function projectsOptions(teamId: string, page: number) {
  return queryOptions({
    queryKey: ['projects', teamId, page],
    queryFn: async () => ({ teamId, page, items: [] as Array<{ id: string }> }),
  })
}
```

### Share one options factory

```ts
import { QueryClient, useQuery, queryOptions } from '@tanstack/react-query'

export const queryClient = new QueryClient()

export function userOptions(userId: string) {
  return queryOptions({
    queryKey: ['user', userId],
    queryFn: async () => ({ id: userId, name: 'Tanner' }),
  })
}

export function useUser(userId: string) {
  return useQuery(userOptions(userId))
}

export function preloadUser(userId: string) {
  return queryClient.ensureQueryData(userOptions(userId))
}
```

### Use skipToken for typesafe absence

```ts
import { skipToken, useQuery } from '@tanstack/react-query'

export function useMaybeTodo(todoId: string | undefined) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: todoId ? async () => ({ id: todoId }) : skipToken,
  })
}
```

## Common Mistakes

### CRITICAL Missing variable in key

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useProject(teamId: string) {
  return useQuery({
    queryKey: ['project'],
    queryFn: async () => ({ teamId }),
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useProject(teamId: string) {
  return useQuery({
    queryKey: ['project', teamId],
    queryFn: async () => ({ teamId }),
  })
}
```

Query keys define cache identity; missing variables merge distinct data.

Source: TanStack/query:docs/framework/react/guides/query-keys.md

### HIGH Key and queryFn drift

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo(todoId: string) {
  return useQuery({ queryKey: ['todo'], queryFn: async () => ({ id: todoId }) })
}
```

Correct:

```ts
import { queryOptions, useQuery } from '@tanstack/react-query'

function todoOptions(todoId: string) {
  return queryOptions({
    queryKey: ['todo', todoId],
    queryFn: async () => ({ id: todoId }),
  })
}

export function useTodo(todoId: string) {
  return useQuery(todoOptions(todoId))
}
```

Options factories keep identity, fetch behavior, and inference together across hooks and prefetches.

Source: TanStack/query:docs/eslint/prefer-query-options.md

### HIGH skipToken inside suspense query

Wrong:

```ts
import { skipToken, useSuspenseQuery } from '@tanstack/react-query'

export function useTodo(todoId: string | undefined) {
  return useSuspenseQuery({
    queryKey: ['todo', todoId],
    queryFn: todoId ? async () => ({ id: todoId }) : skipToken,
  })
}
```

Correct:

```ts
import { skipToken, useQuery } from '@tanstack/react-query'

export function useTodo(todoId: string | undefined) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: todoId ? async () => ({ id: todoId }) : skipToken,
  })
}
```

Suspense queries require a guaranteed query function and cannot be conditionally disabled.

Source: TanStack/query:docs/framework/react/guides/suspense.md

See also: `compositions/enforce-query-best-practices-with-eslint` for rules that enforce key and options mistakes.
