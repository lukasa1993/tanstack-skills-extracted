# Foundations

Client setup, keys, options, fetching, defaults, and abstractions.

<a id="source-tanstack-query-intent-core-build-query-abstractions"></a>

## Build Query Abstractions

Source: `tanstack-query-intent-core-build-query-abstractions`.

### Core Patterns

Prefer a `queryOptions` factory as the base abstraction. Hooks, loaders, prefetches, suspense queries, and `QueryClient` calls can all consume it.

```ts
import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query'

export function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    staleTime: 60_000,
  })
}

export function useInvoice(id: number) {
  return useQuery(invoiceOptions(id))
}

export function useSuspenseInvoice(id: number) {
  return useSuspenseQuery(invoiceOptions(id))
}
```

Compose one-off options at the usage site:

```ts
const invoice = useQuery({
  ...invoiceOptions(id),
  select: (data) => data.createdAt,
  throwOnError: true,
})
```

### Common Mistakes

#### HIGH Custom hook is the only abstraction

Wrong:

```ts
export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  })
}
```

Correct:

```ts
export function invoiceOptions(id: number) {
  return queryOptions({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
  })
}

export function useInvoice(id: number) {
  return useQuery(invoiceOptions(id))
}
```

Custom hooks cannot run in route loaders, server prefetches, or event handlers. Options factories can.

Source: https://tkdodo.eu/blog/creating-query-abstractions

#### HIGH Wide UseQueryOptions wrapper breaks inference

Wrong:

```ts
function useInvoice(id: number, options?: Partial<UseQueryOptions<Invoice>>) {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => fetchInvoice(id),
    ...options,
  })
}
```

Correct:

```ts
useQuery({
  ...invoiceOptions(id),
  select: (invoice) => invoice.createdAt,
})
```

Let `queryOptions` and usage-site composition preserve `select` inference.

Source: https://tkdodo.eu/blog/creating-query-abstractions

#### MEDIUM Wrapper hides Query result state

Wrong:

```ts
export function useInvoice(id: number) {
  const { data } = useQuery(invoiceOptions(id))
  return data
}
```

Correct:

```ts
export function useInvoice(id: number) {
  return useQuery(invoiceOptions(id))
}
```

Keep the Query result surface available unless the abstraction owns every loading, error, and refetch behavior.

Source: TanStack/query:docs/framework/react/guides/queries.md

<a id="source-tanstack-query-intent-core-coordinate-query-execution"></a>

## Coordinate Query Execution

Source: `tanstack-query-intent-core-coordinate-query-execution`.

### Setup

```tsx
import { useQuery } from '@tanstack/react-query'

export function Projects(props: { userId?: string }) {
  const projects = useQuery({
    queryKey: ['projects', props.userId],
    queryFn: async () => [{ id: 'p1', userId: props.userId }],
    enabled: Boolean(props.userId),
  })

  return <pre>{JSON.stringify(projects.data ?? [])}</pre>
}
```

### Core Patterns

#### Gate by dependency

```ts
import { useQuery } from '@tanstack/react-query'

export function useUserProjects(userId: string | undefined) {
  return useQuery({
    queryKey: ['projects', userId],
    queryFn: async () => [{ id: 'p1', userId }],
    enabled: userId !== undefined,
  })
}
```

#### Run dynamic parallel queries

```ts
import { useQueries } from '@tanstack/react-query'

export function useMessages(ids: Array<string>) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['message', id],
      queryFn: async () => ({ id, text: 'Hello' }),
    })),
  })
}
```

#### Show background refresh separately

```tsx
import { useIsFetching } from '@tanstack/react-query'

export function GlobalRefreshIndicator() {
  const count = useIsFetching()
  return count > 0 ? <p>Refreshing</p> : null
}
```

### Common Mistakes

#### HIGH Imperative disabled query

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useSearch(term: string) {
  return useQuery({
    queryKey: ['search'],
    queryFn: async () => [term],
    enabled: false,
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useSearch(term: string) {
  return useQuery({
    queryKey: ['search', term],
    queryFn: async () => [term],
    enabled: term.length > 0,
  })
}
```

Permanent disabling opts out of normal invalidation and dependency-driven cache behavior.

Source: TanStack/query:docs/framework/react/guides/disabling-queries.md

#### HIGH Duplicate useQueries keys

Wrong:

```ts
import { useQueries } from '@tanstack/react-query'

export function useUsers(ids: Array<string>) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['user'],
      queryFn: async () => ({ id }),
    })),
  })
}
```

Correct:

```ts
import { useQueries } from '@tanstack/react-query'

export function useUsers(ids: Array<string>) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ['user', id],
      queryFn: async () => ({ id }),
    })),
  })
}
```

Duplicate keys can share placeholder, selected, or cached data between different items.

Source: TanStack/query:docs/framework/react/reference/useQueries.md

#### MEDIUM Full-page spinner on background refetch

Wrong:

```tsx
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return query.isFetching ? (
    <p>Loading</p>
  ) : (
    <pre>{JSON.stringify(query.data)}</pre>
  )
}
```

Correct:

```tsx
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return (
    <pre>
      {query.isFetching ? 'Refreshing ' : ''}
      {JSON.stringify(query.data ?? [])}
    </pre>
  )
}
```

`isFetching` also covers background refreshes after data is already available.

Source: TanStack/query:docs/framework/react/guides/background-fetching-indicators.md

<a id="source-tanstack-query-intent-core-design-query-keys-and-options"></a>

## Design Query Keys And Options

Source: `tanstack-query-intent-core-design-query-keys-and-options`.

### Setup

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

### Core Patterns

#### Put every query variable in the key

```ts
import { queryOptions } from '@tanstack/react-query'

export function projectsOptions(teamId: string, page: number) {
  return queryOptions({
    queryKey: ['projects', teamId, page],
    queryFn: async () => ({ teamId, page, items: [] as Array<{ id: string }> }),
  })
}
```

#### Share one options factory

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

#### Use skipToken for typesafe absence

```ts
import { skipToken, useQuery } from '@tanstack/react-query'

export function useMaybeTodo(todoId: string | undefined) {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: todoId ? async () => ({ id: todoId }) : skipToken,
  })
}
```

### Common Mistakes

#### CRITICAL Missing variable in key

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

#### HIGH Key and queryFn drift

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

#### HIGH skipToken inside suspense query

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

<a id="source-tanstack-query-intent-core-fetch-and-observe-queries"></a>

## Fetch And Observe Queries

Source: `tanstack-query-intent-core-fetch-and-observe-queries`.

### Setup

```tsx
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1, title: 'Ship' }],
  })

  if (query.isPending) return <p>Loading</p>
  if (query.isError) return <p>{query.error.message}</p>
  return <pre>{JSON.stringify(query.data)}</pre>
}
```

### Core Patterns

#### Fetch imperatively through QueryClient

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function loadTodo(todoId: string) {
  return queryClient.fetchQuery({
    queryKey: ['todo', todoId],
    queryFn: async () => ({ id: todoId }),
  })
}
```

#### Ensure cached data for loaders

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function ensureTodos() {
  return queryClient.ensureQueryData({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
}
```

#### Distinguish status from fetchStatus

```tsx
import { useQuery } from '@tanstack/react-query'

export function TodoCount() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  const label =
    query.fetchStatus === 'fetching' && query.status === 'success'
      ? 'Refreshing'
      : 'Ready'
  return (
    <p>
      {query.data?.length ?? 0} {label}
    </p>
  )
}
```

### Common Mistakes

#### CRITICAL Void query function

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      await Promise.resolve([{ id: 1 }])
    },
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () => Promise.resolve([{ id: 1 }]),
  })
}
```

Query functions must return data; a missing return caches `undefined`.

Source: TanStack/query:docs/eslint/no-void-query-fn.md

#### HIGH Only checking pending offline

Wrong:

```tsx
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
    networkMode: 'online',
  })
  return query.isPending ? <p>Loading</p> : <p>{query.fetchStatus}</p>
}
```

Correct:

```tsx
import { useQuery } from '@tanstack/react-query'

export function Todos() {
  const query = useQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
    networkMode: 'online',
  })
  return query.fetchStatus === 'paused' ? <p>Offline</p> : <p>{query.status}</p>
}
```

`status` describes data state; `fetchStatus` describes whether fetching is paused, fetching, or idle.

Source: TanStack/query:docs/framework/react/guides/queries.md

#### HIGH Using queries for writes

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useSaveTodo(title: string) {
  return useQuery({
    queryKey: ['saveTodo', title],
    queryFn: async () => ({ id: 1, title }),
  })
}
```

Correct:

```ts
import { useMutation } from '@tanstack/react-query'

export function useSaveTodo() {
  return useMutation({
    mutationFn: async (title: string) => ({ id: 1, title }),
  })
}
```

Queries are for reads; writes need mutation lifecycle hooks, invalidation, rollback, and mutation state.

Source: TanStack/query:docs/framework/react/guides/mutations.md

See also: `core/tune-defaults-freshness-retries-and-refetching` for how defaults change status behavior.

<a id="source-tanstack-query-intent-core-tune-defaults-freshness-retr-58e4e7c9"></a>

## Tune Defaults Freshness Retries And Refetching

Source: `tanstack-query-intent-core-tune-defaults-freshness-retr-58e4e7c9`.

### Setup

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

### Core Patterns

#### Set freshness close to the data source

```ts
import { queryOptions } from '@tanstack/react-query'

export const settingsOptions = queryOptions({
  queryKey: ['settings'],
  queryFn: async () => ({ theme: 'system' }),
  staleTime: 5 * 60_000,
})
```

#### Disable retries in tests

```ts
import { QueryClient } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
}
```

#### Use networkMode deliberately

```ts
import { queryOptions } from '@tanstack/react-query'

export const metricsOptions = queryOptions({
  queryKey: ['metrics'],
  queryFn: async () => ({ count: 1 }),
  networkMode: 'online',
})
```

### Common Mistakes

#### HIGH Confusing gcTime with freshness

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

#### HIGH static staleTime blocks invalidation expectations

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

#### HIGH Tests hang on retries

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

<a id="source-tanstack-query-intent-core-understand-query-internals-a-8ab976f4"></a>

## Understand Query Internals And Observers

Source: `tanstack-query-intent-core-understand-query-internals-a-8ab976f4`.

### Mental Model

`QueryClient` owns the caches. `QueryCache` stores `Query` instances. Hooks and adapter APIs create `QueryObserver` instances that subscribe components to one query. Observer-level options like `select`, `staleTime`, polling, and tracked result access shape what each component sees.

An inactive query can exist in the cache without active observers. It can be read imperatively, hydrated, invalidated, or garbage collected, but it is not the same as a component actively observing query state.

### Core Patterns

#### Use observers for UI reads

```tsx
function TodoPage({ id }: { id: string }) {
  const todo = useQuery({
    queryKey: ['todo', id],
    queryFn: () => fetchTodo(id),
  })

  if (todo.isPending) return <p>Loading...</p>
  if (todo.isError) return <p>{todo.error.message}</p>
  return <h1>{todo.data.title}</h1>
}
```

#### Use QueryClient for cache orchestration

```ts
await queryClient.ensureQueryData(todoOptions(id))
queryClient.invalidateQueries({ queryKey: ['todo', id] })
queryClient.setQueryData(['todo', id], (old) => old && { ...old, title })
```

### Common Mistakes

#### HIGH Treating cache presence as active usage

Wrong:

```tsx
const todo = queryClient.getQueryData(['todo', id])
return <TodoView todo={todo} />
```

Correct:

```tsx
const todo = useQuery(todoOptions(id))
return <TodoView todo={todo.data} />
```

UI reads should create observers so invalidation, refetch triggers, stale status, and garbage collection behave as expected.

Source: https://tkdodo.eu/blog/inside-react-query

#### MEDIUM Expecting one query to have one option set

Wrong:

```ts
// assume staleTime is stored only on the Query
queryClient.getQueryCache().find({ queryKey })?.options.staleTime
```

Correct:

```ts
const query = queryClient.getQueryCache().find({ queryKey })
const observerStaleTimes = query?.observers.map(
  (observer) => observer.options.staleTime,
)
```

Several options are observer-level, so multiple components can observe the same query with different selectors or freshness behavior.

Source: https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations

#### MEDIUM Debugging without checking observer count

Wrong:

```ts
queryClient.invalidateQueries({ queryKey: ['todos'] })
// expect every cached todo query to refetch immediately
```

Correct:

```ts
queryClient.invalidateQueries({ queryKey: ['todos'], refetchType: 'active' })
```

Inactive queries are not automatically the same as mounted queries. Check observer count in devtools when invalidation or garbage collection looks surprising.

Source: https://tkdodo.eu/blog/inside-react-query

<a id="source-tanstack-query-intent-lifecycle-setup-query-client-and-providers"></a>

## Setup Query Client And Providers

Source: `tanstack-query-intent-lifecycle-setup-query-client-and-providers`.

### Setup

```tsx
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function AppProviders(props: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
```

### Core Patterns

#### Create request-local SSR clients

```ts
import { QueryClient } from '@tanstack/react-query'

export function createServerQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000 } },
  })
}
```

#### Use adapter-native providers

```ts
import { QueryClient } from '@tanstack/query-core'

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: 2 } },
  })
}
```

React and Preact use `QueryClientProvider`; Vue uses `VueQueryPlugin`; Angular uses `provideTanStackQuery`; Svelte and Lit use their adapter provider/controller APIs.

#### Pass an explicit client at integration boundaries

```ts
import { QueryClient } from '@tanstack/query-core'

const queryClient = new QueryClient()

export function getTodos() {
  return queryClient.ensureQueryData({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1, title: 'Ship' }],
  })
}
```

### Common Mistakes

#### CRITICAL New client on every render

Wrong:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function App(props: { children: React.ReactNode }) {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
```

Correct:

```tsx
import * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function App(props: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
```

Recreating the client discards caches and subscriptions on render.

Source: TanStack/query:docs/eslint/stable-query-client.md

#### CRITICAL Shared SSR cache between users

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export function createRequestQueryClient() {
  return new QueryClient()
}
```

A module-level server client can leak one request's cached data into another request.

Source: TanStack/query:docs/framework/react/guides/ssr.md

#### HIGH Ambiguous Lit fallback client

Wrong:

```ts
import { QueryController } from '@tanstack/lit-query'

export class TodoElement extends HTMLElement {
  todos = new QueryController(this, {
    queryKey: ['todos'],
    queryFn: async () => [],
  })
}
```

Correct:

```ts
import { QueryClient } from '@tanstack/query-core'
import { QueryController } from '@tanstack/lit-query'

const queryClient = new QueryClient()

export class TodoElement extends HTMLElement {
  todos = new QueryController(
    this,
    { queryKey: ['todos'], queryFn: async () => [] },
    queryClient,
  )
}
```

Lit controllers need a clear provider or explicit client when the element is not under a provider tree.

Source: TanStack/query:docs/framework/lit/guides/reactive-controllers-vs-hooks.md

See also: `lifecycle/ssr-hydration-and-streaming` for server cache handoff.
