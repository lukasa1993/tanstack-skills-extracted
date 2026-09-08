# Migrate V8 To V9 — Complete shared breaking-change inventory: 11. Update TypeScript feature generics and helpers

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 11. Update TypeScript feature generics and helpers


Most core types add `TFeatures` before their data/value parameters:

| V8                            | V9                                       |
| ----------------------------- | ---------------------------------------- |
| `Column<TData>`               | `Column<TFeatures, TData, TValue>`       |
| `ColumnDef<TData>`            | `ColumnDef<TFeatures, TData, TValue>`    |
| `Table<TData>`                | `Table<TFeatures, TData>`                |
| `Row<TData>`                  | `Row<TFeatures, TData>`                  |
| `Cell<TData, TValue>`         | `Cell<TFeatures, TData, TValue>`         |
| `createColumnHelper<TData>()` | `createColumnHelper<TFeatures, TData>()` |

Prefer inference. Use `typeof features` only where an explicit type boundary is necessary; use `StockFeatures` when that is genuinely the selected feature set. Wrap column arrays with `columnHelper.columns([...])` to preserve individual and nested `TValue` inference.

`RowData` is now `Record<string, any> | Array<any>`, not `unknown`. Wrap primitive records in an object or array shape.

Global `TableMeta`/`ColumnMeta` declaration merging can remain, but add `TFeatures` as the first generic. Prefer per-table type-only slots where isolation helps:

```ts
const features = tableFeatures({
  columnFilteringFeature,
  tableMeta: metaHelper<MyTableMeta>(),
  columnMeta: metaHelper<MyColumnMeta>(),
  filterMeta: metaHelper<MyFilterMeta>(),
})
```

Replace global `FilterFns`, `SortFns`, and `AggregationFns` augmentation with the matching registry slots; their object keys supply the string-literal names. Replace `FilterMeta` augmentation with the `filterMeta` slot unless global behavior is intentional.
