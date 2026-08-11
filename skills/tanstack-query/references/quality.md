# Quality and migration

Lint rules, tests, and major-version migration.

<a id="source-tanstack-query-intent-compositions-enforce-query-best-p-48bbbabb"></a>

## Enforce Query Best Practices With Eslint

Source: `tanstack-query-intent-compositions-enforce-query-best-p-48bbbabb`.

### Setup

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended']]
```

### Core Integration Patterns

#### Use strict when generating Query-heavy code

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended-strict']]
```

#### Prefer option factories

```ts
import { queryOptions, useQuery } from '@tanstack/react-query'

const todosOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1 }],
})

export function useTodos() {
  return useQuery(todosOptions)
}
```

#### Keep inference-sensitive property order

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ nextCursor: pageParam + 1 }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextCursor,
  })
}
```

### Common Mistakes

#### MEDIUM Strict rule not enabled

Wrong:

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended']]
```

Correct:

```js
import pluginQuery from '@tanstack/eslint-plugin-query'

export default [...pluginQuery.configs['flat/recommended-strict']]
```

Strict mode catches option-factory and inference patterns that agents commonly miss.

Source: TanStack/query:docs/eslint/eslint-plugin-query.md

#### MEDIUM Infinite option property order

Wrong:

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryFn: async () => ({ nextCursor: 1 }),
    queryKey: ['feed'],
    getNextPageParam: (page) => page.nextCursor,
    initialPageParam: 0,
  })
}
```

Correct:

```ts
import { useInfiniteQuery } from '@tanstack/react-query'

export function useFeed() {
  return useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: async ({ pageParam }) => ({ nextCursor: pageParam + 1 }),
    initialPageParam: 0,
    getNextPageParam: (page) => page.nextCursor,
  })
}
```

Some infinite-query inference depends on stable option ordering.

Source: TanStack/query:docs/eslint/infinite-query-property-order.md

#### MEDIUM Mutation option property order

Wrong:

```ts
import { useMutation } from '@tanstack/react-query'

export function useSave() {
  return useMutation({
    onSuccess: () => console.log('saved'),
    mutationFn: async (title: string) => title,
  })
}
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

The mutation property order rule preserves inference for mutation options.

Source: TanStack/query:docs/eslint/mutation-property-order.md

See also: `core/design-query-keys-and-options` for the patterns these rules protect.

<a id="source-tanstack-query-intent-lifecycle-migrate-major-versions-33ec74ce"></a>

## Migrate Major Versions And Codemods

Source: `tanstack-query-intent-lifecycle-migrate-major-versions-33ec74ce`.

### Setup

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
    gcTime: 5 * 60 * 1000,
  })
}
```

### Core Patterns

#### Use object syntax everywhere

```ts
import { QueryClient, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function useTodo(id: string) {
  return useQuery({ queryKey: ['todo', id], queryFn: async () => ({ id }) })
}

export function prefetchTodo(id: string) {
  return queryClient.prefetchQuery({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
  })
}
```

#### Rename cacheTime to gcTime

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 10 * 60 * 1000 } },
})
```

#### Migrate keepPreviousData

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

### Common Mistakes

#### CRITICAL v4 overload syntax

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery(['todos'], async () => [{ id: 1 }])
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({ queryKey: ['todos'], queryFn: async () => [{ id: 1 }] })
}
```

v5 removed hook and client overloads in favor of a single object signature.

Source: TanStack/query:docs/framework/react/guides/migrating-to-v5.md

#### HIGH Removed query callbacks

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
    onSuccess: () => console.log('loaded'),
  })
}
```

Correct:

```tsx
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

export function TodosLogger() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  React.useEffect(() => {
    if (data) console.log('loaded')
  }, [data])
  return null
}
```

v5 removed query callbacks from queries; react to data changes outside the query options.

Source: TanStack/query:docs/framework/react/guides/migrating-to-v5.md

#### HIGH cacheTime in v5

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { cacheTime: 60_000 } },
})
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 60_000 } },
})
```

`cacheTime` was renamed to `gcTime` to describe garbage collection of unused queries.

Source: TanStack/query:docs/framework/react/guides/migrating-to-v5.md

<a id="source-tanstack-query-intent-lifecycle-test-query-code"></a>

## Test Query Code

Source: `tanstack-query-intent-lifecycle-test-query-code`.

### Setup

```tsx
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return function TestWrapper(props: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    )
  }
}
```

### Core Patterns

#### Create a client per test

```ts
import { QueryClient } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}
```

#### Await async state

```ts
import { QueryClient } from '@tanstack/react-query'

export async function loadTodosForTest() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return queryClient.fetchQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
}
```

#### Clear after direct client tests

```ts
import { QueryClient } from '@tanstack/react-query'

export function dispose(queryClient: QueryClient) {
  queryClient.clear()
}
```

### Common Mistakes

#### CRITICAL Shared test client

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}
```

A shared client leaks cache and mutation state across tests.

Source: TanStack/query:docs/framework/react/guides/testing.md

#### HIGH Retry backoff in tests

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

Default retries delay failure and make tests look hung.

Source: TanStack/query:docs/framework/react/guides/testing.md

#### HIGH Asserting before async success

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
const promise = queryClient.fetchQuery({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1 }],
})
console.log(queryClient.getQueryData(['todos']))
await promise
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
await queryClient.fetchQuery({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1 }],
})
console.log(queryClient.getQueryData(['todos']))
```

Query state is asynchronous; assert after the query promise resolves or the UI wait completes.

Source: TanStack/query:docs/framework/react/guides/testing.md
