# Migrate V8 To V9 — Complete breaking-change map: TypeScript and helper changes

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Complete breaking-change map: TypeScript and helper changes


| v8                                                             | v9                                                                                          |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `createColumnHelper<Person>()`                                 | `createColumnHelper<typeof features, Person>()`                                             |
| Plain column array                                             | Prefer `columnHelper.columns([...])` to preserve each nested column's `TValue`              |
| `ColumnDef<TData>`                                             | `ColumnDef<TFeatures, TData, TValue>`                                                       |
| `Column<TData>`                                                | `Column<TFeatures, TData, TValue>`                                                          |
| `Table<TData>` / `Row<TData>`                                  | `Table<TFeatures, TData>` / `Row<TFeatures, TData>`                                         |
| `Cell<TData, TValue>`                                          | `Cell<TFeatures, TData, TValue>`                                                            |
| Global `TableMeta<TData>` / `ColumnMeta<TData, TValue>`        | Add `TFeatures` first, or register per-table `tableMeta` / `columnMeta` with `metaHelper()` |
| Augment `FilterFns`, `SortFns`, `AggregationFns`, `FilterMeta` | Register `filterFns`, `sortFns`, `aggregationFns`, and `filterMeta` slots                   |
| `RowData = unknown`                                            | Row data must be a record or array                                                          |

Infer `TFeatures` with `typeof features`. If deliberately using `stockFeatures`, use `StockFeatures`. Do not manually propagate generics when a helper can infer them.
