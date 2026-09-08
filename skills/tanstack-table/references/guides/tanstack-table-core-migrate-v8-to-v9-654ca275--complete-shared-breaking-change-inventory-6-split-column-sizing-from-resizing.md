# Migrate V8 To V9 — Complete shared breaking-change inventory: 6. Split column sizing from resizing

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 6. Split column sizing from resizing


V8's combined sizing feature became two tree-shakeable features:

- Register `columnSizingFeature` for sizes, offsets, and total-size APIs.
- Also register `columnResizingFeature` for drag handles and transient interaction state.
- `columnResizingFeature` cannot stand alone.

| V8                         | V9                       |
| -------------------------- | ------------------------ |
| `columnSizingInfo` state   | `columnResizing` state   |
| `setColumnSizingInfo(...)` | `setColumnResizing(...)` |
| `onColumnSizingInfoChange` | `onColumnResizingChange` |

The current source spelling is `setColumnResizing` with an uppercase `C`.
