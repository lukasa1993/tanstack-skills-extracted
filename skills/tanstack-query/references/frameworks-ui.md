# Frameworks and UI state

Adapter reactivity, status, errors, suspense, and devtools.

<a id="source-tanstack-query-intent-framework-debug-with-devtools"></a>

## Debug With Devtools

Source: `tanstack-query-intent-framework-debug-with-devtools`.

This skill builds on `lifecycle/setup-query-client-and-providers`.

### Setup

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Devtools() {
  return <ReactQueryDevtools initialIsOpen={false} />
}
```

### Hooks and Components

#### Lazy-load production devtools

```tsx
import * as React from 'react'

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
)

export function LazyDevtools() {
  return (
    <React.Suspense fallback={null}>
      <ReactQueryDevtoolsProduction />
    </React.Suspense>
  )
}
```

#### Embed a panel

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

export function DevtoolsPanel() {
  return <ReactQueryDevtoolsPanel />
}
```

#### Use adapter-specific packages

```ts
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

export const devtools = { ReactQueryDevtools, VueQueryDevtools }
```

### Common Mistakes

#### MEDIUM Eager production devtools

Wrong:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function AppDevtools() {
  return <ReactQueryDevtools />
}
```

Correct:

```tsx
import * as React from 'react'

const Devtools = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
)
export function AppDevtools() {
  return (
    <React.Suspense fallback={null}>
      <Devtools />
    </React.Suspense>
  )
}
```

Production devtools should be lazy-loaded from the production entry.

Source: TanStack/query:docs/framework/react/devtools.md

#### MEDIUM Mock offline misconception

Wrong:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Devtools() {
  return <ReactQueryDevtools initialIsOpen />
}
```

Correct:

```ts
import { onlineManager } from '@tanstack/react-query'

export function setOfflineForTest() {
  onlineManager.setOnline(false)
}
```

Devtools inspect state; use Query managers or browser tooling to model network state.

Source: TanStack/query:docs/reference/onlineManager.md

#### HIGH Devtools outside provider

Wrong:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Root() {
  return <ReactQueryDevtools />
}
```

Correct:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()
export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

Devtools need the same QueryClient context as the app.

Source: TanStack/query:docs/framework/react/devtools.md

<a id="source-tanstack-query-intent-framework-handle-status-and-errors"></a>

## Handle Status And Errors

Source: `tanstack-query-intent-framework-handle-status-and-errors`.

### Core Patterns

Prefer data-first rendering when stale data is useful. A failed background refetch can produce `isError` while `data` is still available.

```tsx
const todos = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })

if (todos.data)
  return <TodoList todos={todos.data} isRefreshing={todos.isFetching} />
if (todos.isPending) return <Spinner />
if (todos.isError) return <ErrorMessage error={todos.error} />
return null
```

Use `throwOnError` when render-time Error Boundaries should own the fallback:

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  throwOnError: (error) => error.status >= 500,
})
```

Use global cache callbacks for cross-cutting notifications:

```ts
import { QueryCache, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) showToast(error.message)
    },
  }),
})
```

### Common Mistakes

#### HIGH Hiding stale data on background error

Wrong:

```tsx
if (query.isError) return <ErrorMessage error={query.error} />
if (query.data) return <Todos todos={query.data} />
```

Correct:

```tsx
if (query.data)
  return (
    <Todos todos={query.data} staleError={query.isError ? query.error : null} />
  )
if (query.isError) return <ErrorMessage error={query.error} />
```

Background refetch failures should not necessarily erase already-rendered data.

Source: https://tkdodo.eu/blog/status-checks-in-react-query

#### HIGH Sending validation errors to a global boundary

Wrong:

```ts
useMutation({ mutationFn: submitForm, throwOnError: true })
```

Correct:

```ts
useMutation({
  mutationFn: submitForm,
  throwOnError: (error) => error.status >= 500,
})
```

Handle expected 4xx validation errors near the form. Send unexpected server failures to the boundary.

Source: https://tkdodo.eu/blog/react-query-error-handling

#### MEDIUM Duplicating toast notifications per observer

Wrong:

```ts
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  onError: toastError,
})
```

Correct:

```ts
new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.state.data !== undefined) toastError(error)
    },
  }),
})
```

Observer-level callbacks can duplicate notifications across components. Use cache-level callbacks for global side effects.

Source: https://tkdodo.eu/blog/react-query-error-handling

<a id="source-tanstack-query-intent-framework-use-framework-adapter-reactivity"></a>

## Use Framework Adapter Reactivity

Source: `tanstack-query-intent-framework-use-framework-adapter-reactivity`.

This skill builds on `lifecycle/setup-query-client-and-providers` and `core/design-query-keys-and-options`.

### Setup

```ts
import { queryOptions } from '@tanstack/react-query'

export function todoOptions(id: string) {
  return queryOptions({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
  })
}
```

### Hooks and Components

#### Keep Vue refs in the key

```ts
import { computed, toRef } from 'vue'
import { useQuery } from '@tanstack/vue-query'

export function useTodo(props: { id: string }) {
  const id = toRef(props, 'id')
  return useQuery(
    computed(() => ({
      queryKey: ['todo', id.value],
      queryFn: async () => ({ id: id.value }),
    })),
  )
}
```

#### Use Solid option functions

```ts
import { createQuery } from '@tanstack/solid-query'

export function useTodo(id: () => string) {
  return createQuery(() => ({
    queryKey: ['todo', id()],
    queryFn: async () => ({ id: id() }),
  }))
}
```

#### Convert Angular Observable clients to promises

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'
import { firstValueFrom, of } from 'rxjs'

export class TodosQuery {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => firstValueFrom(of([{ id: 1 }])),
  }))
}
```

### Common Mistakes

#### HIGH Vue ref unwrapped

Wrong:

```ts
import { useQuery } from '@tanstack/vue-query'

export function useTodo(id: { value: string }) {
  return useQuery({
    queryKey: ['todo', id.value],
    queryFn: async () => ({ id: id.value }),
  })
}
```

Correct:

```ts
import { computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'

export function useTodo(id: { value: string }) {
  return useQuery(
    computed(() => ({
      queryKey: ['todo', id.value],
      queryFn: async () => ({ id: id.value }),
    })),
  )
}
```

Vue reactive inputs need to stay reactive through the options object or query key.

Source: TanStack/query:docs/framework/vue/reactivity.md

#### HIGH Svelte store syntax in v6

Wrong:

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  const query = createQuery({ queryKey: ['todos'], queryFn: async () => [] })
</script>
```

Correct:

```svelte
<script lang="ts">
  import { createQuery } from '@tanstack/svelte-query'
  const query = createQuery(() => ({
    queryKey: ['todos'],
    queryFn: async () => [],
  }))
</script>
```

Svelte Query v6 uses rune-compatible option functions rather than the older store shape.

Source: TanStack/query:docs/framework/svelte/migrate-from-v5-to-v6.md

#### HIGH Angular Observable returned directly

Wrong:

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'
import { of } from 'rxjs'

export class TodosQuery {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => of([{ id: 1 }]),
  }))
}
```

Correct:

```ts
import { injectQuery } from '@tanstack/angular-query-experimental'
import { firstValueFrom, of } from 'rxjs'

export class TodosQuery {
  todos = injectQuery(() => ({
    queryKey: ['todos'],
    queryFn: () => firstValueFrom(of([{ id: 1 }])),
  }))
}
```

Query functions must resolve data; Angular HttpClient Observables need conversion to promises.

Source: TanStack/query:docs/framework/angular/angular-httpclient-and-other-data-fetching-clients.md

See also: `core/design-query-keys-and-options` for key identity across adapters.

<a id="source-tanstack-query-intent-framework-use-suspense-and-error-0e96f8ec"></a>

## Use Suspense And Error Boundaries

Source: `tanstack-query-intent-framework-use-suspense-and-error-0e96f8ec`.

This skill builds on `core/fetch-and-observe-queries` and `lifecycle/prefetch-and-remove-request-waterfalls`.

### Setup

```tsx
import { Suspense } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'

function Todos() {
  const { data } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return <pre>{JSON.stringify(data)}</pre>
}

export function App() {
  return (
    <Suspense fallback={<p>Loading</p>}>
      <Todos />
    </Suspense>
  )
}
```

### Hooks and Components

#### Reset query errors with the boundary

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

export function QueryErrorBoundary(props: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary }) => (
            <button onClick={resetErrorBoundary}>Retry</button>
          )}
        >
          {props.children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

#### Use suspense when data must be defined

```ts
import { useSuspenseQuery } from '@tanstack/react-query'

export function useTodos() {
  return useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
}
```

#### Use normal queries for disabled flows

```ts
import { useQuery } from '@tanstack/react-query'

export function useMaybeTodo(id: string | undefined) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
    enabled: Boolean(id),
  })
}
```

### Common Mistakes

#### HIGH Disabled suspense query

Wrong:

```ts
import { useSuspenseQuery } from '@tanstack/react-query'

export function useTodo(id: string | undefined) {
  return useSuspenseQuery({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
    enabled: Boolean(id),
  })
}
```

Correct:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodo(id: string | undefined) {
  return useQuery({
    queryKey: ['todo', id],
    queryFn: async () => ({ id }),
    enabled: Boolean(id),
  })
}
```

Suspense hooks guarantee `data` and do not support conditional disabling like normal queries.

Source: TanStack/query:docs/framework/react/guides/suspense.md

#### HIGH Missing reset boundary

Wrong:

```tsx
import { useSuspenseQuery } from '@tanstack/react-query'

export function Todos() {
  const { data } = useSuspenseQuery({
    queryKey: ['todos'],
    queryFn: async () => [{ id: 1 }],
  })
  return <pre>{JSON.stringify(data)}</pre>
}
```

Correct:

```tsx
import { QueryErrorResetBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

export function WrappedTodos(props: { children: React.ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary onReset={reset} fallback={<p>Error</p>}>
          {props.children}
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

Error boundaries need Query reset coordination so failed queries can retry after reset.

Source: TanStack/query:docs/framework/react/reference/QueryErrorResetBoundary.md

#### MEDIUM query.promise without flag

Wrong:

```ts
import { useQuery } from '@tanstack/react-query'

export function useTodoPromise() {
  return useQuery({ queryKey: ['todo', 1], queryFn: async () => ({ id: 1 }) })
    .promise
}
```

Correct:

```ts
import { QueryClient, useQuery } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { experimental_prefetchInRender: true } },
})

export function useTodoPromise() {
  return useQuery({ queryKey: ['todo', 1], queryFn: async () => ({ id: 1 }) })
    .promise
}
```

The stable `promise` property requires the experimental prefetch-in-render flag.

Source: TanStack/query:docs/framework/react/guides/suspense.md

See also: `lifecycle/ssr-hydration-and-streaming` for streamed hydration constraints.
