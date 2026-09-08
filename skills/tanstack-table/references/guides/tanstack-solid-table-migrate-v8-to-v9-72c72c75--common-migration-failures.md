# Migrate V8 To V9 — Common migration failures

[Guide and prerequisites](./tanstack-solid-table-migrate-v8-to-v9-72c72c75.md) · Published skill · `@tanstack/solid-table@9.2.4`.

## Common migration failures

- Calling `createTable({ data: data() })` and freezing the initial array instead of providing a getter.
- Leaving row models in table options or omitting their prerequisite feature.
- Reading atoms in an untracked component child body and expecting Solid updates.
- Supplying controlled state without getter properties or per-slice callbacks.
- Destructuring prototype-backed object methods.
- Updating pinning state names but not CSS and region APIs.
- Treating changed “some selected” semantics as checkbox indeterminate state.
