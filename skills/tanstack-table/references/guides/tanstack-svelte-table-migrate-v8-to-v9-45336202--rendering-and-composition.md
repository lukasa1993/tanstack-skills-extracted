# Migrate V8 To V9 — Rendering and Composition

[Guide and prerequisites](./tanstack-svelte-table-migrate-v8-to-v9-45336202.md) · Published skill · `@tanstack/svelte-table@9.2.4`.

## Rendering and Composition

| v8                                       | v9                                                                               |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `flexRender(...)` / `<svelte:component>` | `<FlexRender {cell} />`, `<FlexRender {header} />`, or `<FlexRender {footer} />` |
| Component returned directly              | `renderComponent(Component, props)`                                              |
| Svelte snippet content                   | `renderSnippet(snippet, props)`                                                  |
| Repeated raw options                     | `tableOptions(...)` composition                                                  |
| Repeated table conventions               | `createTableHook({ features, ... })` and its pre-bound helpers                   |

`createTableHook` returns a feature-bound table creator and column helper; use it for application-wide conventions, not as a required migration step.
