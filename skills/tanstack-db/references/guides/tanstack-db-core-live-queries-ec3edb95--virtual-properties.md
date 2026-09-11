# Live Queries — Virtual Properties

[Guide and prerequisites](./tanstack-db-core-live-queries-ec3edb95.md) · Published skill · `@tanstack/db@0.9.0`.

## Virtual Properties

Live query results include computed, read-only virtual properties on every row:

- `$synced`: `true` when no pending local optimistic write affects the row;
  `false` while one does. This is local mutation status, not proof that a
  backend uploaded, confirmed, or read back the row.
- `$origin`: `"local"` if the last confirmed change came from this client, otherwise `"remote"`.
- `$key`: the row key for the result.
- `$collectionId`: the source collection ID.

These props are added automatically and can be used in `where`, `select`, and `orderBy` clauses. Do not persist them back to storage.
