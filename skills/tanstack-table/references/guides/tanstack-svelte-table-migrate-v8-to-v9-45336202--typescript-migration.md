# Migrate V8 To V9 — TypeScript Migration

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## TypeScript Migration

- Core types now take `TFeatures` first: `ColumnDef<typeof features, Person>`, `Column<typeof features, Person>`, `Row<typeof features, Person>`, `Table<typeof features, Person>`.
- Replace `createColumnHelper<Person>()` with `createColumnHelper<typeof features, Person>()`; wrap arrays in `columnHelper.columns([...])` for inference.
- With `stockFeatures`, use `StockFeatures` as the feature type.
- `TableMeta` and `ColumnMeta` declaration merging still works only after adding `TFeatures` first. Prefer per-table `tableMeta`/`columnMeta: metaHelper<...>()` slots.
- Replace global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation with `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta: metaHelper<...>()` slots. Registered keys become valid string references.
- Prefer explicit object row types; `RowData` is restricted to records or arrays.
