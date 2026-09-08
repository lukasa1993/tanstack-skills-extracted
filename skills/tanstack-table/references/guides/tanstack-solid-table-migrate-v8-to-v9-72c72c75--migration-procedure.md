# Migrate V8 To V9 — Migration procedure

[Guide and prerequisites](./tanstack-solid-table-migrate-v8-to-v9-72c72c75.md) · Published skill · `@tanstack/solid-table@9.2.4`.

## Migration procedure

1. Replace `createSolidTable` with `createTable` and inventory used features, processing, state, and APIs.
2. Build `tableFeatures()` in prerequisite order; remove `getCoreRowModel` and old row-model placement.
3. Apply all pinning, sizing, sorting, row, and selection mappings above.
4. Update helpers/types with `typeof features`; migrate meta and function augmentation to per-feature slots where appropriate.
5. Preserve Solid tracking with getters for `data` and controlled state; replace `getState()` and `onStateChange`.
6. Choose internal, controlled-signal, or external-atom ownership per slice.
7. Replace unbound row/cell/column/header methods and migrate rendering.
8. Add `tableOptions`, `table.Subscribe`, or `createTableHook` only where composition or fine-grained rendering calls for them.
9. Type-check and exercise every enabled client- and server-side flow.
10. Audit away `stockFeatures` when production tree-shaking matters.
