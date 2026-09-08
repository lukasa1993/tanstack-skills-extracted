# Migrate V8 To V9 — Complete shared breaking-change inventory: 5. Replace physical column pinning with logical pinning

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 5. Replace physical column pinning with logical pinning


V9 has no `left`/`right` aliases. Replace all state keys, return-value comparisons, arguments, and API families:

| V8                                                                                         | V9                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `columnPinning.left` / `.right`                                                            | `.start` / `.end`                                             |
| `column.pin('left' \| 'right')`                                                            | `column.pin('start' \| 'end')`                                |
| `column.getIsPinned() === 'left' \| 'right'`                                               | compare with `'start' \| 'end'`                               |
| `row.getLeftVisibleCells()` / `getRightVisibleCells()`                                     | `getStartVisibleCells()` / `getEndVisibleCells()`             |
| `table.getLeftHeaderGroups()` / `getRightHeaderGroups()`                                   | `getStartHeaderGroups()` / `getEndHeaderGroups()`             |
| `table.getLeftFooterGroups()` / `getRightFooterGroups()`                                   | `getStartFooterGroups()` / `getEndFooterGroups()`             |
| `table.getLeftFlatHeaders()` / `getRightFlatHeaders()`                                     | `getStartFlatHeaders()` / `getEndFlatHeaders()`               |
| `table.getLeftLeafHeaders()` / `getRightLeafHeaders()`                                     | `getStartLeafHeaders()` / `getEndLeafHeaders()`               |
| `table.getLeftLeafColumns()` / `getRightLeafColumns()`                                     | `getStartLeafColumns()` / `getEndLeafColumns()`               |
| `table.getLeftVisibleLeafColumns()` / `getRightVisibleLeafColumns()`                       | `getStartVisibleLeafColumns()` / `getEndVisibleLeafColumns()` |
| `table.getLeftTotalSize()` / `getRightTotalSize()`                                         | `getStartTotalSize()` / `getEndTotalSize()`                   |
| `'left' \| 'right'` passed to `getStart`, `getAfter`, `getIndex`, or pinned-region helpers | `'start' \| 'end'`                                            |

This names logical regions; it does not automatically apply DOM direction or sticky CSS. Use logical CSS such as `inset-inline-start`/`insetInlineStart` and `inset-inline-end`/`insetInlineEnd`. `columnResizeDirection` remains `'ltr' | 'rtl'`.
