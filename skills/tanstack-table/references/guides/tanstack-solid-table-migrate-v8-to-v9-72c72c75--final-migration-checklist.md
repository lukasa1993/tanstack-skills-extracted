# Migrate V8 To V9 — Final migration checklist

[Guide and prerequisites](./tanstack-solid-table-migrate-v8-to-v9-72c72c75.md) · Published skill · `@tanstack/solid-table@9.2.4`.

## Final migration checklist

- [ ] Replace createSolidTable with createTable and preserve reactive inputs through getters.
- [ ] Register every used stock feature explicitly and order prerequisites before slots.
- [ ] Remove `getCoreRowModel`; move all eight optional row models into `tableFeatures`.
- [ ] Move `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` into feature slots.
- [ ] Replace `table.getState()` and onStateChange with tracked atom/store reads, per-slice callbacks, subscriptions, or external atoms.
- [ ] Audit Solid tracking scopes, controlled getters, atom precedence, and reset ownership.
- [ ] Replace unbound/copied row, cell, column, and header methods.
- [ ] Apply the complete logical pinning map and CSS changes.
- [ ] Split pinning options and sizing/resizing; rename the resizing state, setter, and callback.
- [ ] Apply every sorting rename and remove each listed internal API.
- [ ] Pair some-selected with the matching all-selected predicate.
- [ ] Update TFeatures helpers/types, `columns()`, `StockFeatures`, meta/registry slots, and RowData.
- [ ] Migrate Solid FlexRender and use tableOptions/createTableHook only for repeated conventions.
- [ ] Type-check and exercise every enabled client/manual feature and LTR/RTL layout flow.
- [ ] Audit away temporary stockFeatures usage when explicit tree-shaking is intended.
