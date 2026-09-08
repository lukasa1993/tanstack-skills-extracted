# Migrate V8 To V9 — TypeScript Migration

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## TypeScript Migration

- Add `TFeatures` first: `ColumnDef<typeof features, Person>`, `Column<typeof features, Person>`, `Row<typeof features, Person>`, `Table<typeof features, Person>`.
- Replace `createColumnHelper<Person>()` with `createColumnHelper<typeof features, Person>()`; use `columnHelper.columns([...])` for inference.
- Use `StockFeatures` when using `stockFeatures`.
- Existing `TableMeta`/`ColumnMeta` declaration merging must add `TFeatures` first. Prefer per-table `tableMeta`/`columnMeta: metaHelper<...>()` slots.
- Replace global `FilterFns`, `SortFns`, `AggregationFns`, and `FilterMeta` augmentation with registry slots and `filterMeta: metaHelper<...>()`; registered keys become valid strings.
- `RowData` is restricted to records or arrays; prefer explicit object row types.
