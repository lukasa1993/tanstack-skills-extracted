# Migrate V8 To V9 — Final Checklist

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Final Checklist

- [ ] Svelte is version 5+; old writable-store patterns are removed.
- [ ] `createSvelteTable` is replaced by `createTable`.
- [ ] Explicit features, row models, and function registries are in `tableFeatures`.
- [ ] `getCoreRowModel` and the separate `rowModels` shape are removed.
- [ ] Reactive inputs and controlled slices use getters/runes; state reads use v9 surfaces.
- [ ] Svelte creation selectors, `table.state`, `subscribeTable`, `SubscribeSource`, and selected-state generic parameters are removed.
- [ ] `onStateChange` is replaced; atom/state ownership does not overlap.
- [ ] Rendering uses `FlexRender`, `renderComponent`, or `renderSnippet`.
- [ ] Prototype method calls, pinning, sizing/resizing, sorting, row, and selection semantics are audited.
- [ ] Helpers, types, meta, registries, and `RowData` use the v9 generic/slot shapes.
- [ ] Temporary `stockFeatures` usage has an explicit removal plan.
