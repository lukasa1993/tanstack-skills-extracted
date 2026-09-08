# Migrate V8 To V9 — Complete shared breaking-change inventory: 2. Move row models into feature slots and rename factories

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 2. Move row models into feature slots and rename factories


V8 `get*RowModel()` table options and the removed `rowModels` object are gone. V9 `create*RowModel()` factories take no registry arguments and are registered as named feature slots.

| V8 table option                                    | V9 `tableFeatures` slot                | V9 factory                                     |
| -------------------------------------------------- | -------------------------------------- | ---------------------------------------------- |
| `getCoreRowModel: getCoreRowModel()`               | automatic; omit for the built-in model | built-in `createCoreRowModel()` is the default |
| `getFilteredRowModel: getFilteredRowModel()`       | `filteredRowModel`                     | `createFilteredRowModel()`                     |
| `getSortedRowModel: getSortedRowModel()`           | `sortedRowModel`                       | `createSortedRowModel()`                       |
| `getPaginationRowModel: getPaginationRowModel()`   | `paginatedRowModel`                    | `createPaginatedRowModel()`                    |
| `getExpandedRowModel: getExpandedRowModel()`       | `expandedRowModel`                     | `createExpandedRowModel()`                     |
| `getGroupedRowModel: getGroupedRowModel()`         | `groupedRowModel`                      | `createGroupedRowModel()`                      |
| `getFacetedRowModel: getFacetedRowModel()`         | `facetedRowModel`                      | `createFacetedRowModel()`                      |
| `getFacetedMinMaxValues: getFacetedMinMaxValues()` | `facetedMinMaxValues`                  | `createFacetedMinMaxValues()`                  |
| `getFacetedUniqueValues: getFacetedUniqueValues()` | `facetedUniqueValues`                  | `createFacetedUniqueValues()`                  |

For a custom core model, use the `coreRowModel` slot rather than restoring the v8 table option.

Move registries from table options or factory arguments into these feature slots:

| V8               | V9               |
| ---------------- | ---------------- |
| `sortingFns`     | `sortFns`        |
| `filterFns`      | `filterFns`      |
| `aggregationFns` | `aggregationFns` |

Register only the built-ins the table references by string name, importing each individually (`filterFn_includesString`, `sortFn_alphanumeric`, `aggregationFn_sum`, and so on) alongside any custom functions. The full registry objects (`filterFns`, `sortFns`, `aggregationFns` exports) still work but bundle every built-in. A slot's keys become the valid string names in column definitions, and `'auto'` resolves only registered functions.

Aggregation is independent from grouping. Add `rowAggregationFeature` for
`aggregationFn`, `aggregatedCell`, `column.getAggregationValue(options?)`, and
`cell.getIsAggregated`. A root total does not require grouping. Convert legacy
custom callables `(columnId, leafRows, childRows) => result` to
`constructAggregationFn({ aggregate: (context) => result, merge? })`
definitions. Replace `column.getAggregationFn()` with
`column.getAggregationFns()`; arrays in `aggregationFn` return keyed objects.
Replace the old `AggregationFn` and `CreatedAggregationFn` types with
`AggregationFnDef`. Aggregation row selection is shared across every definition
on a column: `maxAggregationDepth` defaults to `0`, while `1` selects direct
sub-rows and `Infinity` selects terminal rows. Explicit totals can override it
with the single object signature
`column.getAggregationValue({ rows, maxDepth })`; positional row and depth
arguments are not supported. All built-ins consume the same selected `rows`.
Custom definitions can inspect grouped `subRows`, and `merge` receives matching
`subRowResults`. Use `table.getMaxSubRowDepth()` when a depth should derive from
the deepest structural row in the core model.
