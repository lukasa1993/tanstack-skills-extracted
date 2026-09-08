# Migrate V8 To V9 — Common migration failures

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Common migration failures

### [CRITICAL] Silencing a missing API instead of registering its feature

If `table.nextPage`, `column.toggleSorting`, or a state slice disappears, add the associated feature. Do not cast the table to a broader type.

### [CRITICAL] Mixing v8 and v9 configuration styles

Do not combine v8 `get*RowModel` options, a removed `rowModels` object, or physical pinning names with the current `tableFeatures` slots.

### [HIGH] Treating `stockFeatures` or `useLegacyTable` as the finished migration

Both obscure missing feature decisions; `useLegacyTable` is deprecated and React-only. Reach behavior parity, then complete the explicit v9 setup.

### [HIGH] Copying one adapter's state or rendering API into another

Core concepts are shared, but reactive reads, constructors, and rendering helpers are not. Load the package-local adapter skills.
