# Migrate V8 To V9 — Lit State Migration

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## Lit State Migration

- `table.getState().sorting` becomes `table.state.sorting`, `table.store.state.sorting`, or narrow `table.atoms.sorting.get()`.
- `table.state` contains all registered slices by default. Pass a second-argument selector to `controller.table(...)` only to narrow the render-selected surface.
- Use `table.subscribe(table.store, stableSelector, renderCallback)` for selected template state. Keep the selector reference stable outside render.
- Controlled state uses Lit `@state()` fields and matching `on[State]Change` callbacks that resolve value-or-function updaters.
- Top-level `onStateChange` is removed. Use per-slice callbacks, external atoms, or `table.store.subscribe` for all changes.
- External atoms come from `@tanstack/store` and are provided through `atoms`. Never provide both `atoms.pagination` and `state.pagination`.
- The controller requests host updates for table and option-store changes; do not create a new controller in render.
- Treat `table.baseAtoms` as internal writable state; prefer feature APIs or external atoms.
