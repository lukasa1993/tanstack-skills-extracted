# Migrate V8 To V9 — Rendering and Composition

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## Rendering and Composition

| v8                         | v9                                                                            |
| -------------------------- | ----------------------------------------------------------------------------- |
| `flexRender(def, context)` | `FlexRender({ cell })`, `FlexRender({ header })`, or `FlexRender({ footer })` |
| Standalone helper only     | `table.FlexRender({ cell })` is also available                                |
| Repeated raw options       | `tableOptions(...)` composition                                               |
| Repeated conventions       | `createTableHook({ features, ... })`                                          |

`createTableHook` returns a host-bound app table helper and pre-bound column helper. Construct the app helper with the Lit host, then call its `.table()` during render. It is optional and intended for recurring application conventions.
