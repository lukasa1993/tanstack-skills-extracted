# Migrate V8 To V9 — Final migration checklist

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Final migration checklist

- [ ] Replace `useReactTable` with `useTable`; remove any temporary `useLegacyTable` endpoint.
- [ ] Register every used stock feature explicitly and put each prerequisite before its dependent slot.
- [ ] Remove `getCoreRowModel`; move all eight optional row-model factories into `tableFeatures`.
- [ ] Move `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` into feature slots.
- [ ] Replace `table.getState()` and top-level `onStateChange`; choose selectors, per-slice callbacks, store subscription, or external atoms deliberately.
- [ ] Audit external-atom precedence/reset ownership and every controlled slice update path.
- [ ] Replace destructured, spread, serialized, or bare-callback row/cell/column/header methods.
- [ ] Replace every pinning state key, argument, comparison, method family, and sticky CSS use of left/right with start/end.
- [ ] Split `enablePinning`; split sizing/resizing and rename its state, setter, and callback.
- [ ] Apply every sorting option, method, type, interface, and built-in registry rename.
- [ ] Remove each listed underscore-prefixed internal API and use the public replacement.
- [ ] Rebuild indeterminate selection checks with the matching all-selected predicate.
- [ ] Update helpers and explicit public types for `TFeatures`; use `columns()` and `StockFeatures` where applicable.
- [ ] Update meta generics or per-table meta slots; replace function/meta augmentation with registry slots.
- [ ] Ensure `RowData` is a record or array.
- [ ] Migrate FlexRender usage; adopt `tableOptions` or `createTableHook` only where repeated composition warrants it.
- [ ] Type-check and test every enabled client/manual feature flow, including LTR/RTL pinning and resizing.
- [ ] Audit away temporary `stockFeatures` usage when explicit tree-shaking is the intended end state.
