# Migrate V8 To V9 — Complete breaking-change map: Shared API and behavior changes

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Complete breaking-change map: Shared API and behavior changes


Column pinning now uses logical regions, with no deprecated aliases:

| v8                                                             | v9                                                            |
| -------------------------------------------------------------- | ------------------------------------------------------------- |
| `columnPinning.left` / `.right`                                | `.start` / `.end`                                             |
| `column.pin('left' \| 'right')`                                | `column.pin('start' \| 'end')`                                |
| `getIsPinned() === 'left' \| 'right'`                          | `'start' \| 'end'`                                            |
| `row.getLeftVisibleCells()` / `getRightVisibleCells()`         | `getStartVisibleCells()` / `getEndVisibleCells()`             |
| `getLeftHeaderGroups()` / `getRightHeaderGroups()`             | `getStartHeaderGroups()` / `getEndHeaderGroups()`             |
| `getLeftFooterGroups()` / `getRightFooterGroups()`             | `getStartFooterGroups()` / `getEndFooterGroups()`             |
| `getLeftFlatHeaders()` / `getRightFlatHeaders()`               | `getStartFlatHeaders()` / `getEndFlatHeaders()`               |
| `getLeftLeafHeaders()` / `getRightLeafHeaders()`               | `getStartLeafHeaders()` / `getEndLeafHeaders()`               |
| `getLeftLeafColumns()` / `getRightLeafColumns()`               | `getStartLeafColumns()` / `getEndLeafColumns()`               |
| `getLeftVisibleLeafColumns()` / `getRightVisibleLeafColumns()` | `getStartVisibleLeafColumns()` / `getEndVisibleLeafColumns()` |
| `getLeftTotalSize()` / `getRightTotalSize()`                   | `getStartTotalSize()` / `getEndTotalSize()`                   |
| `column.getStart('left')`                                      | `column.getStart('start')`                                    |
| `column.getAfter('right')`                                     | `column.getAfter('end')`                                      |
| `column.getIndex('left' \| 'right')`                           | `column.getIndex('start' \| 'end')`                           |

This is logical table positioning, not automatic DOM-direction styling. Use CSS logical inset properties for sticky layouts. `columnResizeDirection` is unchanged.

Other exact changes:

| v8                                        | v9                                                                                |
| ----------------------------------------- | --------------------------------------------------------------------------------- |
| Table option `enablePinning`              | `enableColumnPinning` plus `enableRowPinning`; per-column `enablePinning` remains |
| Combined `ColumnSizing`                   | `columnSizingFeature`; add `columnResizingFeature` for interaction                |
| `columnSizingInfo`                        | `columnResizing`                                                                  |
| `setColumnSizingInfo()`                   | `setColumnResizing()`                                                             |
| `onColumnSizingInfoChange`                | `onColumnResizingChange`                                                          |
| `sortingFn`                               | `sortFn`                                                                          |
| `column.getSortingFn()`                   | `column.getSortFn()`                                                              |
| `column.getAutoSortingFn()`               | `column.getAutoSortFn()`                                                          |
| `SortingFn` / `SortingFns` / `sortingFns` | `SortFn` / `SortFns` / `sortFns`                                                  |
| `row._getAllCellsByColumnId()`            | `row.getAllCellsByColumnId()`                                                     |
| `table._getPinnedRows()`                  | `getTopRows()`, `getCenterRows()`, or `getBottomRows()`                           |
| `table._getFacetedRowModel()`             | Public faceting APIs on the relevant column/table                                 |
| `table._getFacetedMinMaxValues()`         | `getFacetedMinMaxValues()`                                                        |
| `table._getFacetedUniqueValues()`         | `getFacetedUniqueValues()`                                                        |

All other underscore-prefixed internals are removed. `getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean **at least one**, including when all are selected. Compute indeterminate state with `getIsSomeRowsSelected() && !getIsAllRowsSelected()` or `getIsSomePageRowsSelected() && !getIsAllPageRowsSelected()`.
