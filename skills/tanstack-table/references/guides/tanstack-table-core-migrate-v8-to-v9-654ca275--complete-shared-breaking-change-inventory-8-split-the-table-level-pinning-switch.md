# Migrate V8 To V9 — Complete shared breaking-change inventory: 8. Split the table-level pinning switch

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 8. Split the table-level pinning switch


Replace the v8 table option `enablePinning` with `enableColumnPinning` and/or `enableRowPinning`. Do not mechanically rename a column definition's `enablePinning`: that column-level option still exists.
