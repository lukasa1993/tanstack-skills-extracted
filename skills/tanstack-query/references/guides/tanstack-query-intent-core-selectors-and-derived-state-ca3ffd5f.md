# Selectors And Derived State

<a id="source-tanstack-query-intent-core-selectors-and-derived-state"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../data-shaping.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Seed Placeholder Select And Transform Data](./tanstack-query-intent-core-seed-placeholder-select-and-5c98438e-84b92527.md).
Prerequisite: [Shape Data And Render Efficiently](./tanstack-query-intent-framework-shape-data-and-render-e-feb144a6-276ce42a.md).

## Core Patterns

Use `select` to subscribe a component to the data shape it actually needs while keeping the full response in the cache.

### Select a stable slice

```tsx
import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'

const productOptions = (id: string) =>
  queryOptions({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  })

function ProductTitle({ id }: { id: string }) {
  const title = useSuspenseQuery({
    ...productOptions(id),
    select: (product) => product.title,
  })

  return <h1>{title.data}</h1>
}
```

### Stabilize expensive selectors

```tsx
const selectAverageRating = (products: Array<Product>) =>
  expensiveAverage(products)

function ProductSummary({ filters }: { filters: ProductFilters }) {
  return useSuspenseQuery({
    ...productsOptions(filters),
    select: selectAverageRating,
  })
}
```

Use `React.useCallback` when the selector closes over component props. Move it outside the component when it has no dependencies.

### Derive client state instead of syncing it

```tsx
const selectedUser = usersQuery.data?.find((user) => user.id === selectedUserId)
const visibleSelectedUserId = selectedUser ? selectedUserId : null
```

When server data changes, derived values update naturally during render.

## Common Mistakes

### HIGH Syncing derived state through an effect

Wrong:

```tsx
React.useEffect(() => {
  if (!users?.some((user) => user.id === selectedUserId)) {
    setSelectedUserId(null)
  }
}, [users, selectedUserId])
```

Correct:

```tsx
const selectedUser = users?.find((user) => user.id === selectedUserId)
const visibleSelectedUserId = selectedUser ? selectedUserId : null
```

Prefer deriving client state from server state during render when no side effect is required.

Source: https://tkdodo.eu/blog/deriving-client-state-from-server-state

### MEDIUM Inline expensive select reruns on unrelated renders

Wrong:

```tsx
useSuspenseQuery({
  ...productsOptions(filters),
  select: (data) => expensiveSuperTransformation(data),
})
```

Correct:

```tsx
const selectProducts = (data: Array<Product>) =>
  expensiveSuperTransformation(data)

useSuspenseQuery({
  ...productsOptions(filters),
  select: selectProducts,
})
```

TanStack Query reruns `select` when data changes or the selector function identity changes.

Source: https://tkdodo.eu/blog/react-query-selectors-supercharged

### MEDIUM Using select to throw domain errors

Wrong:

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (todos) => {
    if (!todos.length) throw new Error('No todos')
    return todos
  },
})
```

Correct:

```tsx
useQuery({
  queryKey: ['todos'],
  queryFn: async () => {
    const todos = await fetchTodos()
    if (!todos.length) throw new Error('No todos')
    return todos
  },
})
```

`select` transforms successful data. Query errors belong in the query function.

Source: TanStack/query:docs/framework/react/guides/render-optimizations.md
