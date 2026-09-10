# Stores — Map onto an existing schema

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Map onto an existing schema

- **Your column names, your types.** Name columns anything; use `jsonb`,
  `timestamptz`, whatever — convert in the row mapper. The record shape the
  methods return is fixed; how you store it is not.
- **Extra columns are fine.** Add `user_id`, audit columns, a tenant id. Keep
  them nullable or defaulted so the store's inserts still succeed. The stores
  never read or write columns they do not know about.
- **Omit absent optionals** in row mappers (`...(row.error != null ? { error: row.error } : {})`)
  so records compare cleanly.
