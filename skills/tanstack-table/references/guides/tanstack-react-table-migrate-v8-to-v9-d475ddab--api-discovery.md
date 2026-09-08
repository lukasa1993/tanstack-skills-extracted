# Migrate V8 To V9 — API discovery

[Guide and prerequisites](./tanstack-react-table-migrate-v8-to-v9-d475ddab.md) · Published skill · `@tanstack/react-table@9.2.4`.

## API discovery

Inspect `node_modules/@tanstack/react-table/dist/index.d.ts` and `node_modules/@tanstack/table-core/dist/index.d.ts` for the installed v9 exports and types. Inspect `dist/legacy.d.ts` only to identify temporary bridge code that remains to be removed.
