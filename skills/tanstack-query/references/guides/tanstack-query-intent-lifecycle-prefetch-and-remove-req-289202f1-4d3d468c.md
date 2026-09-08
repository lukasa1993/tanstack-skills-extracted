# Prefetch And Remove Request Waterfalls

<a id="source-tanstack-query-intent-lifecycle-prefetch-and-remove-req-289202f1"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../routing-ssr.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Design Query Keys And Options](./tanstack-query-intent-core-design-query-keys-and-options-c4c8f493.md).
Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).
Prerequisite: [Tune Defaults Freshness Retries And Refetching](./tanstack-query-intent-core-tune-defaults-freshness-retr-58e4e7c9-51f821a0.md).

## Setup

```ts
import { QueryClient, queryOptions } from '@tanstack/react-query'

const queryClient = new QueryClient()

const todosOptions = queryOptions({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1, title: 'Ship' }],
  staleTime: 60_000,
})

export function preloadTodos() {
  return queryClient.prefetchQuery(todosOptions)
}
```

## Core Patterns

### Use loaders for route-critical data

```ts
import { QueryClient, queryOptions } from '@tanstack/react-query'

const queryClient = new QueryClient()
const contactOptions = (contactId: string) =>
  queryOptions({
    queryKey: ['contact', contactId],
    queryFn: async () => ({ id: contactId, name: 'Ada' }),
  })

export function contactLoader(contactId: string) {
  return queryClient.ensureQueryData(contactOptions(contactId))
}
```

### Prefetch before Suspense can suspend

```tsx
import { Suspense } from 'react'
import { usePrefetchQuery, useSuspenseQuery } from '@tanstack/react-query'

const commentsOptions = {
  queryKey: ['comments'],
  queryFn: async () => [{ id: 1 }],
}

function Comments() {
  const { data } = useSuspenseQuery(commentsOptions)
  return <pre>{JSON.stringify(data)}</pre>
}

export function CommentsSection() {
  usePrefetchQuery(commentsOptions)
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Comments />
    </Suspense>
  )
}
```

### Pick the right client method

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function getTodo(id: string) {
  return queryClient.fetchQuery({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
  })
}
```

Use `fetchQuery` when the caller needs data or thrown errors; use `prefetchQuery` when it only needs to warm the cache.

## Common Mistakes

### HIGH Expecting prefetchQuery to return data

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
const data = await queryClient.prefetchQuery({
  queryKey: ['todo', 1],
  queryFn: async () => ({ id: 1 }),
})
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
const data = await queryClient.fetchQuery({
  queryKey: ['todo', 1],
  queryFn: async () => ({ id: 1 }),
})
```

`prefetchQuery` returns void and swallows errors; `fetchQuery` returns data and throws.

Source: TanStack/query:docs/framework/react/guides/prefetching.md

### HIGH Prefetch staleTime only set on prefetch

Wrong:

```ts
import { QueryClient, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()
await queryClient.prefetchQuery({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1 }],
  staleTime: 60_000,
})
export function useTodos() {
  return useQuery({ queryKey: ['todos'], queryFn: async () => [{ id: 1 }] })
}
```

Correct:

```ts
import { QueryClient, queryOptions, useQuery } from '@tanstack/react-query'

const queryClient = new QueryClient()
const options = queryOptions({
  queryKey: ['todos'],
  queryFn: async () => [{ id: 1 }],
  staleTime: 60_000,
})
await queryClient.prefetchQuery(options)
export function useTodos() {
  return useQuery(options)
}
```

Prefetch call options do not automatically configure the later observer.

Source: TanStack/query:docs/framework/react/guides/prefetching.md

### HIGH Suspense prefetch after suspension

Wrong:

```tsx
import * as React from 'react'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'

export function Article() {
  const queryClient = useQueryClient()
  const article = useSuspenseQuery({
    queryKey: ['article'],
    queryFn: async () => ({ id: 1 }),
  })
  React.useEffect(() => {
    queryClient.prefetchQuery({
      queryKey: ['comments'],
      queryFn: async () => [],
    })
  }, [queryClient])
  return <pre>{JSON.stringify(article.data)}</pre>
}
```

Correct:

```tsx
import { Suspense } from 'react'
import { usePrefetchQuery, useSuspenseQuery } from '@tanstack/react-query'

function Article() {
  const article = useSuspenseQuery({
    queryKey: ['article'],
    queryFn: async () => ({ id: 1 }),
  })
  return <pre>{JSON.stringify(article.data)}</pre>
}

export function ArticleRoute() {
  usePrefetchQuery({ queryKey: ['comments'], queryFn: async () => [] })
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Article />
    </Suspense>
  )
}
```

Effects do not run until after a suspenseful query resolves, so they cannot flatten that waterfall.

Source: TanStack/query:docs/framework/react/guides/prefetching.md

See also: `compositions/compose-query-with-tanstack-router-and-start` for Router and Start loader prefetching.
