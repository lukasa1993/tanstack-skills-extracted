# Migrate V8 To V9 — Complete audit checklist

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete audit checklist

- [ ] Load the installed framework adapter's migration and table-state skills.
- [ ] Replace the v8 adapter constructor/hook/controller with its v9 entrypoint.
- [ ] Add a stable `features` object to every table.
- [ ] Inventory every feature API used by table, row, column, cell, and header code; register all 16 required stock features.
- [ ] Use `stockFeatures` only as a temporary parity aid and record an explicit-feature follow-up.
- [ ] Remove `getCoreRowModel()` unless supplying a deliberate custom `coreRowModel` slot.
- [ ] Move all remaining `get*RowModel()` options (or a removed `rowModels: {...}` object, if present) to `create*RowModel()` feature slots.
- [ ] Register each dependent feature before its row-model slot.
- [ ] Move `filterFns`, `sortingFns`/`sortFns`, and `aggregationFns` into feature slots, registering individually imported built-ins; pass no registries to factories.
- [ ] Register `rowAggregationFeature` independently and migrate custom aggregation callables to context-based `AggregationFnDef` definitions.
- [ ] Register `columnFilteringFeature` before global filtering and filter/facet dependencies.
- [ ] Register `columnSizingFeature` before `columnResizingFeature`.
- [ ] Replace `table.getState()` and top-level `onStateChange` according to the adapter state guide.
- [ ] Verify every controlled slice has an update path; verify externally owned atoms are reset by their owner.
- [ ] Audit destructured, spread, serialized, or bare-callback instance methods.
- [ ] Replace every column-pinning `left`/`right` key, argument, comparison, method family, and sticky CSS declaration with logical start/end equivalents.
- [ ] Split table-level `enablePinning`; preserve column-def `enablePinning` where intended.
- [ ] Split sizing/resizing features and rename the resizing state, setter, and callback.
- [ ] Replace every `sortingFn`/`SortingFn`/`sortingFns` spelling with its v9 `sort*` spelling.
- [ ] Remove every consumed underscore-prefixed internal API.
- [ ] Recheck indeterminate selection logic against the new “at least one” semantics.
- [ ] Add `TFeatures` to unavoidable explicit core types, helpers, and retained meta augmentation; otherwise restore inference.
- [ ] Replace function-registry and filter-meta declaration merging with per-table slots where appropriate.
- [ ] Ensure every row is a record or array under the stricter `RowData` constraint.
- [ ] Migrate adapter-specific rendering, reactive data inputs, and subscription primitives.
- [ ] Type-check without `any`/casts added merely to suppress migration failures.
- [ ] Test sorting, filtering, faceting, grouping, expansion, pagination, selection, ordering, pinning, sizing, and resizing—only where enabled.
- [ ] Test client/server ownership for every row-model pipeline stage and ensure manual modes receive already-processed data.
- [ ] Test LTR and RTL layouts when column pinning or resizing is enabled.
- [ ] Remove `useLegacyTable` after the incremental migration step that required it.
