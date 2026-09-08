# Migrate V8 To V9 — Complete Shared Breaking-Change Map

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Complete Shared Breaking-Change Map

### Instance methods

Row, cell, column, header, and related object methods now live on shared prototypes and use `this`. Call `row.getValue(...)`, `cell.getContext()`, `column.getCanSort()`, and `header.getContext()` on their instances. Do not destructure them or pass them as bare callbacks. They are not own enumerable properties, so object spread, `Object.keys`, and JSON serialization do not preserve them. Table methods are not affected.

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

This is logical region naming, not automatic DOM direction handling. Prefer CSS `inset-inline-start`/`inset-inline-end`. `columnResizeDirection` is unchanged.

### Feature and state splits

- `enablePinning` splits into `enableColumnPinning` and `enableRowPinning`.
- Interactive resizing requires both `columnSizingFeature` and `columnResizingFeature`; fixed widths need only sizing.
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

All other `_`-prefixed internal APIs are removed, including `_getPinnedRows`, `_getFacetedRowModel`, `_getFacetedMinMaxValues`, and `_getFacetedUniqueValues`; do not seek replacements unless a public API is documented.

`getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean at least one, including all. For an indeterminate checkbox, combine “some” with `!getIsAllRowsSelected()` or `!getIsAllPageRowsSelected()`.
