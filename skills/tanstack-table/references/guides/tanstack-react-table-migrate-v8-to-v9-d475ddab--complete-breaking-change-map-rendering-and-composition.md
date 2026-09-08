# Migrate V8 To V9 — Complete breaking-change map: Rendering and composition

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## Complete breaking-change map: Rendering and composition


- `flexRender(def, context)` still works. Prefer `<table.FlexRender cell={cell} />`, `<table.FlexRender header={header} />`, or the standalone `<FlexRender ... />` for the v9 component form.
- Use `tableOptions()` to type reusable partial option objects.
- Use `createTableHook()` only when several tables share features, row models, defaults, and registered components. It returns app-specific helpers such as `useAppTable`, `createAppColumnHelper`, and table/cell/header context hooks; it is not required for one-off tables.
- Invoke row, cell, column, header, and related methods through their instance. Their methods now live on prototypes, so destructuring, object spread, `Object.keys`, and `JSON.stringify` do not preserve/expose them. Table-instance methods are not affected.
