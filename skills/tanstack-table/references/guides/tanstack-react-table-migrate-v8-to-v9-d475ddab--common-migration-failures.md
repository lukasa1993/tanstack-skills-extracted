# Migrate V8 To V9 — Common migration failures

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Common migration failures

- An API is missing because its feature was not registered, not because v9 removed it.
- A row model is placed in table options or an obsolete `rowModels` object instead of its feature slot.
- A controlled value is supplied without its matching per-slice callback, freezing that slice.
- A React parent still re-renders for every table update because the default selector was retained while assuming atom reads alone narrowed it.
- An extracted `row.getValue`, `cell.getContext`, or column/header method loses `this`.
- Sticky pinning is renamed in state but not in CSS or every header/row sizing call.
- An indeterminate selection checkbox stays indeterminate when all rows are selected.
