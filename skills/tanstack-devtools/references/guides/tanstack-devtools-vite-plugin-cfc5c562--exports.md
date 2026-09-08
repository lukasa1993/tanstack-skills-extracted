# Devtools Vite Plugin — Exports

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Exports

From `packages/devtools-vite/src/index.ts`:

- `devtools` -- main plugin factory, returns `Array<Plugin>`
- `defineDevtoolsConfig` -- identity function for type-safe config
- `TanStackDevtoolsViteConfig` -- config type (re-exported)
- `ConsoleLevel` -- `'log' | 'warn' | 'error' | 'info' | 'debug'`
