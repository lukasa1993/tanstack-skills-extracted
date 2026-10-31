# React Db — Virtual Properties

[Guide and prerequisites](./tanstack-react-db-ba0ab260.md) · Published skill · `@tanstack/react-db@1.0.0-rc.1.1`.

## Virtual Properties

Live query results include computed, read-only virtual properties on every row:

- `$hasPendingWrites`: `true` while a pending local optimistic write affects
  the row; `false` otherwise. It does not prove backend confirmation.
- `$origin`: `"local"` if the last confirmed change came from this client, otherwise `"remote"`.
- `$key`: the row key for the result.
- `$collectionId`: the source collection ID.

These props are added automatically and can be used in `where`, `select`, and `orderBy` clauses. Do not persist them back to storage.

```tsx
const { data } = useLiveQuery({
  query: (q) =>
    q
      .from({ todo: todoCollection })
      .where(({ todo }) => eq(todo.$hasPendingWrites, true)),
})
// Shows rows with pending local optimistic writes
```
