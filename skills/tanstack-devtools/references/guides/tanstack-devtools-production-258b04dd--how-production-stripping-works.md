# Devtools Production — How Production Stripping Works

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## How Production Stripping Works

TanStack Devtools has two independent mechanisms for keeping devtools out of production bundles. Understanding both is essential because they serve different project types.

### Mechanism 1: Vite Plugin Auto-Stripping (Vite projects)

The `@tanstack/devtools-vite` plugin includes a sub-plugin named `@tanstack/devtools:remove-devtools-on-build`. When `removeDevtoolsOnBuild` is `true` (the default), this plugin runs during `vite build` and any non-`serve` command where the mode is `production`.

It uses oxc-parser to parse every source file, find imports from these packages, and remove them along with any JSX elements they produce:

- `@tanstack/react-devtools`
- `@tanstack/preact-devtools`
- `@tanstack/solid-devtools`
- `@tanstack/vue-devtools`
- `@tanstack/svelte-devtools`
- `@tanstack/angular-devtools`
- `@tanstack/devtools`

The stripping is AST-based. It removes the import declaration, then finds and removes any JSX elements whose tag name matches one of the imported identifiers. It also traces plugin references inside the `plugins` prop array and removes their imports if they become unused.

Source: `packages/devtools-vite/src/remove-devtools.ts`

This means for a standard Vite project, the default setup from **devtools-app-setup** already handles production correctly with zero additional configuration:

```tsx
// This import and JSX element are completely removed from the production build
import { TanStackDevtools } from '@tanstack/react-devtools'

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools
        plugins={
          [
            /* ... */
          ]
        }
      />
    </>
  )
}
```

### Mechanism 2: Conditional Exports (package.json)

The `@tanstack/devtools` core package uses Node.js conditional exports to serve different bundles based on the environment:

```json
{
  "exports": {
    "workerd": { "import": "./dist/server.js" },
    "browser": {
      "development": { "import": "./dist/dev.js" },
      "import": "./dist/index.js"
    },
    "node": { "import": "./dist/server.js" }
  }
}
```

Key points:

- `browser` + `development` condition resolves to `dev.js` (dev-only extras).
- `browser` without `development` resolves to `index.js` (production build).
- `node` and `workerd` resolve to `server.js` (server-safe, no DOM).

These are built via `tsup-preset-solid` with `dev_entry: true` and `server_entry: true` in `packages/devtools/tsup.config.ts`.
