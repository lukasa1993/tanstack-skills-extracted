# Migrate V8 To V9 — Complete Shared Breaking-Change Map

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## Complete Shared Breaking-Change Map

### Instance methods

Row, cell, column, header, and related methods now live on shared prototypes and use `this`. Call them on their instances. Do not destructure/pass them bare or expect them in object spread, `Object.keys`, or JSON. Table methods are not affected.

### Logical column pinning

V9 has no `left`/`right` aliases.

| old                                                            | new                                                           |
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

Prefer CSS logical inset properties; logical names do not set DOM direction. `columnResizeDirection` is unchanged.

### Pinning, sizing, and resizing

- `enablePinning` splits into `enableColumnPinning` and `enableRowPinning`.
- Interactive resizing requires `columnSizingFeature` and `columnResizingFeature`; fixed sizing needs only sizing.
- `columnSizingInfo` becomes `columnResizing`.
- `setColumnSizingInfo()` becomes `setColumnResizing()`.
- `onColumnSizingInfoChange` becomes `onColumnResizingChange`.

### Sorting, rows, and selection

| v8                             | v9                            |
| ------------------------------ | ----------------------------- |
| `sortingFn`                    | `sortFn`                      |
| `sortingFns`                   | `sortFns`                     |
| `getSortingFn()`               | `getSortFn()`                 |
| `getAutoSortingFn()`           | `getAutoSortFn()`             |
| `SortingFn` / `SortingFns`     | `SortFn` / `SortFns`          |
| `row._getAllCellsByColumnId()` | `row.getAllCellsByColumnId()` |

Other `_`-prefixed internals are removed, including `_getPinnedRows`, `_getFacetedRowModel`, `_getFacetedMinMaxValues`, and `_getFacetedUniqueValues`.

`getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` mean at least one, including all. Use `getIsSomeRowsSelected() && !getIsAllRowsSelected()` or `getIsSomePageRowsSelected() && !getIsAllPageRowsSelected()` for indeterminate UI.
