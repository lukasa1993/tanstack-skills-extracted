# Handle Status And Errors

<a id="source-tanstack-query-intent-framework-handle-status-and-errors"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../frameworks-ui.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Fetch And Observe Queries](./tanstack-query-intent-core-fetch-and-observe-queries-d2520b98.md).
Prerequisite: [Use Suspense And Error Boundaries](./tanstack-query-intent-framework-use-suspense-and-error-0e96f8ec-ef1e87bf.md).

## Core Patterns

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

## Common Mistakes

### HIGH Hiding stale data on background error

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

### HIGH Sending validation errors to a global boundary

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

### MEDIUM Duplicating toast notifications per observer

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
