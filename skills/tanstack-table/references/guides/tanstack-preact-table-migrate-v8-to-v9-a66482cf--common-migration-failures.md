# Migrate V8 To V9 — Common migration failures

[Guide and prerequisites](./tanstack-preact-table-migrate-v8-to-v9-a66482cf.md) · Published skill · `@tanstack/preact-table@9.2.4`.

## Common migration failures

- Keeping React imports or compatibility aliases after adopting the native Preact adapter.
- Registering a row model without its feature, or leaving it on table options.
- Assuming `table.atoms` narrows parent renders while the default full selector is still active.
- Supplying controlled state without its per-slice change handler.
- Destructuring prototype-backed methods.
- Renaming pinning state without updating sticky CSS and all region APIs.
- Using the changed “some selected” semantics directly as checkbox indeterminate state.
