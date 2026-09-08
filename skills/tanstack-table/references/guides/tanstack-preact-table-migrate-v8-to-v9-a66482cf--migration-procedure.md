# Migrate V8 To V9 — Migration procedure

[Guide and prerequisites](./tanstack-preact-table-migrate-v8-to-v9-a66482cf.md) · Published skill · `@tanstack/preact-table@9.2.4`.

## Migration procedure

1. Replace React adapter imports and `useReactTable`; remove Table-only `preact/compat` configuration.
2. Inventory used features, row models, registries, state slices, methods, and `_` internals.
3. Build `tableFeatures()` in prerequisite order; remove `getCoreRowModel` and old row-model placement.
4. Apply all pinning, sizing, sorting, row, and selection mappings above.
5. Update helpers/types with `typeof features`, retarget augmentation, and prefer feature registry/meta slots.
6. Replace `getState()`/`onStateChange`; explicitly choose internal, per-slice controlled, or external-atom ownership.
7. Replace unbound row/cell/column/header methods and migrate rendering.
8. Add `tableOptions`, subscriptions, or `createTableHook` only where reusable composition or render isolation needs them.
9. Type-check and exercise every enabled client- and server-side flow.
10. Audit away `stockFeatures` if the production table should remain tree-shakable.
