# Migrate V8 To V9 — Svelte State Migration

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Svelte State Migration

- Reactive option inputs must remain live: use getters for rune values such as `data` and controlled state slices.
- `table.getState().sorting` becomes the narrow `table.atoms.sorting.get()` read. Use `table.store.get()` when code intentionally needs the complete state.
- Table atom, store, and API reads become reactive inside templates, `$derived`, `$derived.by`, and `$effect`; use native `$derived` values for projections.
- Remove second-argument selectors from `createTable` and `createAppTable` (if present from an earlier v9 version), replace `table.state`, and remove `subscribeTable` / `SubscribeSource` imports.
- `SvelteTable` now has two generic parameters, `AppSvelteTable` has five, and `useTableContext` no longer accepts a selected-state generic.
- For Svelte-owned controlled slices, use `createTableState` and matching `onSortingChange`, `onPaginationChange`, and other per-slice callbacks.
- For shared ownership, provide atoms created by `@tanstack/svelte-store` through `atoms`. Never provide both `atoms.pagination` and `state.pagination`.
- Subscribe to `table.store` to observe every state change. Do not port the removed top-level `onStateChange`.
- Treat `table.baseAtoms` as internal writable state; prefer feature APIs or external atoms.
