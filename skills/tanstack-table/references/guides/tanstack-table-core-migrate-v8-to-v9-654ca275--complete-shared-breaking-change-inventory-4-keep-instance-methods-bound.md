# Migrate V8 To V9 — Complete shared breaking-change inventory: 4. Keep instance methods bound

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Complete shared breaking-change inventory: 4. Keep instance methods bound


Row, cell, column, header, and related object methods moved to shared prototypes. Destructuring, passing a bare callback, spreading, `Object.keys`, and `JSON.stringify` no longer preserve or reveal those methods.

```ts
// v8 code that breaks
const { getValue } = row
rows.map(row.getVisibleCells)

// v9
const value = row.getValue('name')
rows.map((row) => row.getVisibleCells())
```

Audit all methods extracted from rows, cells, columns, headers, and header groups. Table-instance methods are not subject to this specific migration rule.
