# Migrate V8 To V9 — Complete shared breaking-change inventory: 7. Rename sorting APIs

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 7. Rename sorting APIs


| V8                          | V9                       |
| --------------------------- | ------------------------ |
| column-def `sortingFn`      | `sortFn`                 |
| `column.getSortingFn()`     | `column.getSortFn()`     |
| `column.getAutoSortingFn()` | `column.getAutoSortFn()` |
| `SortingFn`                 | `SortFn`                 |
| `SortingFns`                | `SortFns`                |
| built-in `sortingFns`       | `sortFns`                |

Also move the registry to `tableFeatures`, as described above.
