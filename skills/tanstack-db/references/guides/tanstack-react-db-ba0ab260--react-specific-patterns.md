# React Db — React-Specific Patterns

[Guide and prerequisites](./tanstack-react-db-ba0ab260.md) · Published skill · `@tanstack/react-db@1.0.0-rc.1.1`.

## React-Specific Patterns

### Query identity

```tsx
// Structured captured values are included in the derived identity
const { data } = useLiveQuery({
  query: (q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) =>
        and(eq(todo.userId, userId), eq(todo.status, filter)),
      ),
})

// Static query
const { data } = useLiveQuery({
  query: (q) => q.from({ todo: todoCollection }),
})
```

Use `queryKey` only when DB cannot derive identity from structured IR, such as
`.fn.where`, `.fn.select`, `.fn.having`, or as a deliberate performance escape
hatch on a hot render path:

```tsx
const { data } = useLiveQuery({
  queryKey: [todoCollection.id, 'search', search],
  query: (q) =>
    q.from({ todo: todoCollection }).fn.where(({ todo }) => {
      return fuzzyMatch(todo.title, search)
    }),
})
```

Unhashable IR without `queryKey` throws `UnhashableQueryIRError`, even with a
dependency array. Slow or repeated derived identity work warns once and points
to the same `queryKey` escape hatch.

### Suspense + Error Boundary

```tsx
<ErrorBoundary fallback={<div>Error</div>}>
  <Suspense fallback={<div>Loading...</div>}>
    <TodoList />
  </Suspense>
</ErrorBoundary>
```

### Router loader preloading

```tsx
// In route loader:
await todoCollection.preload()

// In component — data available immediately:
const { data } = useLiveQuery({
  query: (q) => q.from({ todo: todoCollection }),
})
```

See ./tanstack-db-meta-framework-69f8ef80.md#source-tanstack-db-meta-framework for full preloading patterns.
