# Migrate V8 To V9 — Installed API discovery

[Guide and prerequisites](./tanstack-table-core-migrate-v8-to-v9-654ca275.md) · Published skill · `@tanstack/table-core@9.2.4`.

## Installed API discovery

Use the installed version, not main-branch memory:

1. Inspect `node_modules/@tanstack/table-core/dist/index.d.ts` for exports.
2. Inspect `dist/types/TableFeatures.d.ts` for valid slots and prerequisites.
3. Inspect `dist/features/<feature>/*.types.d.ts` for current options, state, and APIs.
4. Inspect the installed adapter's `dist/index.d.ts` and its migration skill for entrypoints and rendering.
5. Inspect `dist/legacy.d.ts` only to remove an existing bridge, never to design new v9 code.

If package-manager layout prevents that exact path, resolve the installed package root first. Do not substitute APIs from a different v9 version.
