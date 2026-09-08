# Devtools Production — Key Source Files

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Key Source Files

- `packages/devtools-vite/src/plugin.ts` -- Vite plugin entry, `removeDevtoolsOnBuild` option, sub-plugin registration
- `packages/devtools-vite/src/remove-devtools.ts` -- AST-based stripping logic (oxc-parser + MagicString)
- `packages/devtools/package.json` -- Conditional exports (`browser.development` -> `dev.js`, `browser` -> `index.js`, `node`/`workerd` -> `server.js`)
- `packages/devtools/tsup.config.ts` -- Build config producing `dev.js`, `index.js`, `server.js` via `tsup-preset-solid`
- `packages/devtools-utils/src/react/plugin.tsx` -- `createReactPlugin` returning `[Plugin, NoOpPlugin]`
- `packages/devtools-utils/src/react/panel.tsx` -- `createReactPanel` returning `[Panel, NoOpPanel]`
