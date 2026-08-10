---
name: tanstack-query-intent-core-selectors-and-derived-state
description: "Use this when selecting, transforming, or deriving data from TanStack Query: select functions, selector memoization, fine-grained subscriptions, structural sharing, queryOptions composition with select, and deriving client state from server state instead of syncing it through effects."
license: "MIT"
metadata:
  tanstack-library: "TanStack Query"
  tanstack-library-version: "5.101.0"
  tanstack-package: "@tanstack/query-intent"
  tanstack-package-version: "5.101.0"
  tanstack-requires: "[\"tanstack-query-intent-core-seed-placeholder-select-and-5c98438e\",\"tanstack-query-intent-framework-shape-data-and-render-e-feb144a6\"]"
  tanstack-source-ref: "github:TanStack/query@bdfb2605d0c598a8446b612e715200829b035d49#packages/query-intent"
  tanstack-source-skill: "core/selectors-and-derived-state"
  tanstack-sources: "[\"https://tkdodo.eu/blog/react-query-selectors-supercharged\",\"https://tkdodo.eu/blog/deriving-client-state-from-server-state\",\"TanStack/query:docs/framework/react/guides/render-optimizations.md\",\"TanStack/query:docs/framework/react/reference/queryOptions.md\"]"
  tanstack-type: "core"
---

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
