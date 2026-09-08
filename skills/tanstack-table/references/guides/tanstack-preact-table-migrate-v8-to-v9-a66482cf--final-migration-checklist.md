# Migrate V8 To V9 — Final migration checklist

[Guide and prerequisites](./tanstack-preact-table-migrate-v8-to-v9-a66482cf.md) · Published skill · `@tanstack/preact-table@9.2.4`.

## Final migration checklist

- [ ] Replace React-adapter imports/useReactTable with native Preact imports/useTable and remove Table-only compat aliases.
- [ ] Register every used stock feature explicitly and put prerequisites before dependent slots.
- [ ] Remove `getCoreRowModel`; move all eight optional row-model factories into `tableFeatures`.
- [ ] Move `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` into feature slots.
- [ ] Replace `table.getState()` and top-level `onStateChange`; choose Preact selectors, Subscribe, per-slice callbacks, store subscription, or external atoms.
- [ ] Audit controlled/external ownership and atom precedence.
- [ ] Replace unbound or copied row/cell/column/header methods.
- [ ] Apply the entire left/right to start/end pinning map and logical sticky CSS.
- [ ] Split pinning options and sizing/resizing; rename resizing state, setter, and callback.
- [ ] Apply every sorting option/API/type/registry rename.
- [ ] Remove all listed underscore-prefixed internals and use public replacements.
- [ ] Pair each some-selected check with its all-selected predicate for indeterminate UI.
- [ ] Update TFeatures helpers/types, `columns()`, `StockFeatures`, meta slots, registries, and RowData.
- [ ] Migrate Preact FlexRender and adopt tableOptions/createTableHook only where useful.
- [ ] Type-check and test every enabled client/manual feature plus LTR/RTL layout behavior.
- [ ] Remove temporary stockFeatures after the explicit-feature audit when tree-shaking matters.
