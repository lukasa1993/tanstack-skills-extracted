# Migrate V8 To V9 — API Discovery

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## API Discovery

Inspect `node_modules/@tanstack/lit-table/dist/index.d.ts` and `TableController.d.ts`. Verify feature slots and the exact installed v9 APIs in `node_modules/@tanstack/table-core/dist/`; do not reconstruct v9 from v8 memory.
