# Routing and SSR

Router composition, prefetching, hydration, and streaming.

<a id="source-tanstack-query-intent-compositions-compose-query-with-t-d0bcdebe"></a>

## Compose Query With Tanstack Router And Start

Source: `tanstack-query-intent-compositions-compose-query-with-t-d0bcdebe`.

### Setup

```tsx
import {
  QueryClient,
  QueryClientProvider,
  useSuspenseQuery,
} from '@tanstack/react-query'
import {
  createFileRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

const postsQuery = {
  queryKey: ['posts'],
  queryFn: async () => [{ id: 1, title: 'Router first' }],
}

export const Route = createFileRoute('/posts')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: PostsPage,
})

function PostsPage() {
  const { data } = useSuspenseQuery(postsQuery)
  return <pre>{JSON.stringify(data)}</pre>
}

const router = createRouter({ routeTree, context: { queryClient } })

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

### Core Integration Patterns

#### Put QueryClient in router context

```ts
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreloadStaleTime: 0,
})
```

Set `defaultPreloadStaleTime: 0` when Query owns server-state freshness. Router still preloads and runs loaders, but Query is the cache authority.

#### Use loader ensureQueryData for route data

```ts
import { createFileRoute } from '@tanstack/react-router'

const todoQuery = (todoId: string) => ({
  queryKey: ['todo', todoId],
  queryFn: async () => ({ id: todoId, title: 'Loaded' }),
})

export const Route = createFileRoute('/todos/$todoId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(todoQuery(params.todoId)),
})
```

Treat loaders as event handlers that prime the Query cache. Components should still call `useQuery` or `useSuspenseQuery` so the route has an active Query observer.

#### Prefer Router SSR Query integration for Router SSR

```ts
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()
const router = createRouter({ routeTree, context: { queryClient } })

setupRouterSsrQueryIntegration({ router, queryClient })
```

### Common Mistakes

#### CRITICAL Component-only Query creates route waterfall

Wrong:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

export const Route = createFileRoute('/posts')({ component: PostsPage })
function PostsPage() {
  const { data } = useSuspenseQuery({
    queryKey: ['posts'],
    queryFn: async () => [{ id: 1 }],
  })
  return <pre>{JSON.stringify(data)}</pre>
}
```

Correct:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'

const postsQuery = { queryKey: ['posts'], queryFn: async () => [{ id: 1 }] }
export const Route = createFileRoute('/posts')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: PostsPage,
})
function PostsPage() {
  const { data } = useSuspenseQuery(postsQuery)
  return <pre>{JSON.stringify(data)}</pre>
}
```

The router can load route-critical data before component render.

Source: TanStack/router:https://tanstack.com/router/latest/docs/integrations/query

#### CRITICAL Hand-rolled Router hydration

Wrong:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()
const router = createRouter({ routeTree })
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()
const router = createRouter({ routeTree, context: { queryClient } })
setupRouterSsrQueryIntegration({ router, queryClient })
```

The Router SSR Query integration handles dehydration, hydration, streamed query results, redirects, and provider wrapping.

Source: TanStack/router:https://tanstack.com/router/latest/docs/integrations/query

#### HIGH Next.js mental model copied into Start

Wrong:

```tsx
export default async function Page() {
  const posts = await Promise.resolve([{ id: 1 }])
  return <pre>{JSON.stringify(posts)}</pre>
}
```

Correct:

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ['posts'],
      queryFn: async () => [{ id: 1 }],
    }),
  component: () => <p>Posts loaded by the route</p>,
})
```

Start is powered by TanStack Router; use file routes, loaders, server functions, and Router SSR before Next-specific app/pages APIs.

Source: TanStack/start:https://tanstack.com/start/latest/docs/framework/react/overview

#### HIGH Reading loader data instead of observing Query

Wrong:

```tsx
import { createFileRoute, useLoaderData } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: ({ context }) => context.queryClient.ensureQueryData(postsQuery),
  component: PostsPage,
})

function PostsPage() {
  const posts = useLoaderData({ from: '/posts' })
  return <pre>{JSON.stringify(posts)}</pre>
}
```

Correct:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

function PostsPage() {
  const { data } = useSuspenseQuery(postsQuery)
  return <pre>{JSON.stringify(data)}</pre>
}
```

The loader primes the cache. The component still needs an active Query observer for refetch triggers, invalidation, and garbage collection semantics.

Source: https://tkdodo.eu/blog/tan-stack-router-and-query

See also: `lifecycle/ssr-hydration-and-streaming` for framework SSR recipes.

<a id="source-tanstack-query-intent-lifecycle-prefetch-and-remove-req-289202f1"></a>

## Prefetch And Remove Request Waterfalls

Source: `tanstack-query-intent-lifecycle-prefetch-and-remove-req-289202f1`.

### Setup

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

### Core Patterns

#### Use loaders for route-critical data

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

#### Prefetch before Suspense can suspend

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

#### Pick the right client method

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

### Common Mistakes

#### HIGH Expecting prefetchQuery to return data

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

#### HIGH Prefetch staleTime only set on prefetch

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

#### HIGH Suspense prefetch after suspension

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

<a id="source-tanstack-query-intent-lifecycle-ssr-hydration-and-streaming"></a>

## Ssr Hydration And Streaming

Source: `tanstack-query-intent-lifecycle-ssr-hydration-and-streaming`.

### Setup

```tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

export async function PostsPage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => [{ id: 1 }],
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Posts />
    </HydrationBoundary>
  )
}

function Posts() {
  return <p>Hydrated posts render here</p>
}
```

### Core Patterns

#### Put TanStack Start and Router first

```ts
import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'

const queryClient = new QueryClient()
const router = createRouter({ routeTree, context: { queryClient } })

setupRouterSsrQueryIntegration({ router, queryClient })
```

#### Use per-request clients

```ts
import { QueryClient } from '@tanstack/react-query'

export function createSsrQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })
}
```

#### Hydrate only prefetched data

```tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

export async function Page() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['profile'],
    queryFn: async () => ({ name: 'Tanner' }),
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>Profile</main>
    </HydrationBoundary>
  )
}
```

### Common Mistakes

#### CRITICAL RSC renders fetched data twice

Wrong:

```tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

export async function Page() {
  const queryClient = new QueryClient()
  const posts = await queryClient.fetchQuery({
    queryKey: ['posts'],
    queryFn: async () => [{ id: 1 }],
  })
  return (
    <>
      <p>{posts.length}</p>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <main>Posts</main>
      </HydrationBoundary>
    </>
  )
}
```

Correct:

```tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

export async function Page() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => [{ id: 1 }],
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>Posts</main>
    </HydrationBoundary>
  )
}
```

Server-rendered derived data can desynchronize from client-refetched Query data.

Source: TanStack/query:docs/framework/react/guides/advanced-ssr.md

#### CRITICAL Suspense query not prefetched on server

Wrong:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

export function Posts() {
  const { data } = useSuspenseQuery({
    queryKey: ['posts'],
    queryFn: async () => [{ id: 1 }],
  })
  return <pre>{JSON.stringify(data)}</pre>
}
```

Correct:

```tsx
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from '@tanstack/react-query'

export async function Page() {
  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: async () => [{ id: 1 }],
  })
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main>Posts</main>
    </HydrationBoundary>
  )
}
```

A suspense query that is not prefetched can fetch on the server, fail to hydrate, then fetch again on the client.

Source: TanStack/query:docs/framework/react/guides/ssr.md

#### HIGH SvelteKit query runs after SSR response

Wrong:

```ts
import { QueryClient } from '@tanstack/svelte-query'

export const queryClient = new QueryClient()
```

Correct:

```ts
import { browser } from '$app/environment'
import { QueryClient } from '@tanstack/svelte-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { enabled: browser } },
})
```

SvelteKit SSR needs browser-gated default query execution unless server data is explicitly prefetched.

Source: TanStack/query:docs/framework/svelte/ssr.md

See also: `compositions/compose-query-with-tanstack-router-and-start` for TanStack-owned SSR routing.
