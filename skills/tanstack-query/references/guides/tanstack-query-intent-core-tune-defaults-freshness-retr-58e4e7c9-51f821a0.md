# Tune Defaults Freshness Retries And Refetching

<a id="source-tanstack-query-intent-core-tune-defaults-freshness-retr-58e4e7c9"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).

## Setup

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
})
```

## Core Patterns

### Set freshness close to the data source

```ts
import { queryOptions } from '@tanstack/react-query'

export const settingsOptions = queryOptions({
  queryKey: ['settings'],
  queryFn: async () => ({ theme: 'system' }),
  staleTime: 5 * 60_000,
})
```

### Disable retries in tests

```ts
import { QueryClient } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}
```

### Use networkMode deliberately

```ts
import { queryOptions } from '@tanstack/react-query'

export const metricsOptions = queryOptions({
  queryKey: ['metrics'],
  queryFn: async () => ({ count: 1 }),
  networkMode: 'online',
})
```

## Common Mistakes

### HIGH Confusing gcTime with freshness

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => ({ name: 'Tanner' }),
    gcTime: 60_000,
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => ({ name: 'Tanner' }),
    staleTime: 60_000,
  })
}
```

`gcTime` controls unused cache retention; `staleTime` controls whether cached data is considered fresh.

Source: TanStack/query:docs/framework/react/guides/important-defaults.md

### HIGH static staleTime blocks invalidation expectations

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
    staleTime: 'static',
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
    staleTime: 60_000,
  })
}
```

`staleTime: 'static'` opts out of refetching even when the query is invalidated.

Source: TanStack/query:docs/framework/react/guides/important-defaults.md

### HIGH Tests hang on retries

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})
```

Default retries add delay and can make failing tests wait before surfacing errors.

Source: TanStack/query:docs/framework/react/guides/testing.md

See also: `compositions/persist-offline-and-restore-caches` for persistence rules that depend on gcTime and networkMode.
