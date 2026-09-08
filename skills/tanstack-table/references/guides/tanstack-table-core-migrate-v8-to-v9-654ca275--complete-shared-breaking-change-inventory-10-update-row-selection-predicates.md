# Migrate V8 To V9 — Complete shared breaking-change inventory: 10. Update row-selection predicates

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 10. Update row-selection predicates


`getIsSomeRowsSelected()` and `getIsSomePageRowsSelected()` now mean **at least one**, including the all-selected case. They no longer mean “some but not all.” Build an indeterminate checkbox with both predicates:

```ts
const indeterminate =
  table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
```

For a page checkbox, use `table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()`.
