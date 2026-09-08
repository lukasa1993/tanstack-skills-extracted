# Migrate V8 To V9 — Complete shared breaking-change inventory: 9. Remove internal APIs and use public surfaces

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 9. Remove internal APIs and use public surfaces


All underscore-prefixed internals are unsupported and removed. Known migration points include:

| Removed v8 internal               | V9 public direction                                           |
| --------------------------------- | ------------------------------------------------------------- |
| `row._getAllCellsByColumnId()`    | `row.getAllCellsByColumnId()`                                 |
| `table._getPinnedRows()`          | `table.getTopRows()`, `getCenterRows()`, or `getBottomRows()` |
| `table._getFacetedRowModel()`     | public faceting APIs on the relevant column/table             |
| `table._getFacetedMinMaxValues()` | `getFacetedMinMaxValues()`                                    |
| `table._getFacetedUniqueValues()` | `getFacetedUniqueValues()`                                    |

For any other `_` API, do not guess. Inspect the installed v9 package source for the public replacement or redesign the integration.
