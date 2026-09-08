# Migrate V8 To V9 — Migration procedure

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Migration procedure

1. Upgrade imports and replace `useReactTable` with `useTable`.
2. Inventory every used state slice, table/column/row method, row model, function registry, and internal `_` API.
3. Build `tableFeatures()` with the corresponding features first, followed by row-model and registry slots; remove `getCoreRowModel`.
4. Apply every mapping above, including physical-to-logical pinning and the sizing/resizing split.
5. Add `typeof features` to helpers and explicit public types; migrate meta and function registry augmentation.
6. Replace `getState()` and `onStateChange`; choose internal, controlled per-slice, or external-atom ownership deliberately.
7. Audit destructured object methods and shallow clones of rows/cells/columns/headers.
8. Migrate rendering and optionally introduce `tableOptions`, `table.Subscribe`, or `createTableHook` where they solve an actual composition/render boundary.
9. Type-check, then exercise sorting, filtering, grouping, pagination, expansion, pinning, resizing, selection, and controlled/server-side flows that the table uses.
10. Remove `stockFeatures` after the feature audit if bundle specificity matters; remove `useLegacyTable` rather than treating it as the destination.
