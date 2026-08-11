# Setup and production

App setup, Vite integration, and production behavior.

<a id="source-tanstack-devtools-app-setup"></a>

## Devtools App Setup

Source: `tanstack-devtools-app-setup`.

## TanStack Devtools App Setup

### Setup

#### React (primary)

Install as dev dependencies:

```bash
npm install -D @tanstack/react-devtools @tanstack/devtools-vite
```

Mount `TanStackDevtools` at the root of your application:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TanStackDevtools } from '@tanstack/react-devtools'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <TanStackDevtools />
  </StrictMode>,
)
```

Add plugins via the `plugins` prop. Each plugin needs `name` (string) and `render` (JSX element or render function):

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
;<TanStackDevtools
  plugins={[
    {
      name: 'TanStack Query',
      render: <ReactQueryDevtoolsPanel />,
    },
    {
      name: 'TanStack Router',
      render: <TanStackRouterDevtoolsPanel />,
    },
  ]}
/>
```

#### Vue

```bash
npm install -D @tanstack/vue-devtools
```

Vue uses `component` (not `render`) in plugin definitions. This is the `TanStackDevtoolsVuePlugin` type:

```vue
<script setup lang="ts">
import { TanStackDevtools } from '@tanstack/vue-devtools'
import type { TanStackDevtoolsVuePlugin } from '@tanstack/vue-devtools'
import { VueQueryDevtoolsPanel } from '@tanstack/vue-query-devtools'

const plugins: TanStackDevtoolsVuePlugin[] = [
  { name: 'Vue Query', component: VueQueryDevtoolsPanel },
]
</script>

<template>
  <App />
  <TanStackDevtools :plugins="plugins" />
</template>
```

The Vite plugin (`@tanstack/devtools-vite`) is optional for Vue but recommended for enhanced console logs and go-to-source.

#### Solid

```bash
npm install -D @tanstack/solid-devtools @tanstack/devtools-vite
```

```tsx
import { render } from 'solid-js/web'
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { SolidQueryDevtoolsPanel } from '@tanstack/solid-query-devtools'
import App from './App'

render(
  () => (
    <>
      <App />
      <TanStackDevtools
        plugins={[
          {
            name: 'TanStack Query',
            render: <SolidQueryDevtoolsPanel />,
          },
        ]}
      />
    </>
  ),
  document.getElementById('root')!,
)
```

#### Preact

```bash
npm install -D @tanstack/preact-devtools @tanstack/devtools-vite
```

```tsx
import { render } from 'preact'
import { TanStackDevtools } from '@tanstack/preact-devtools'
import App from './App'

render(
  <>
    <App />
    <TanStackDevtools
      plugins={[
        {
          name: 'Your Plugin',
          render: <YourPluginComponent />,
        },
      ]}
    />
  </>,
  document.getElementById('root')!,
)
```

### Core Patterns

#### Shell Configuration

Pass a `config` prop to `TanStackDevtools` to set initial shell behavior. These values are persisted to `localStorage` after first load and can be changed through the settings panel at runtime.

Storage keys used internally:

- `tanstack_devtools_settings` -- persisted settings
- `tanstack_devtools_state` -- persisted UI state (active tab, panel height, active plugins, persistOpen)

All config properties are optional. Defaults shown below:

```tsx
<TanStackDevtools
  config={{
    defaultOpen: false, // open panel on mount
    hideUntilHover: false, // hide trigger until mouse hover
    position: 'bottom-right', // trigger position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'middle-left' | 'middle-right'
    panelLocation: 'bottom', // panel position: 'top' | 'bottom'
    openHotkey: ['Control', '~'],
    inspectHotkey: ['Shift', 'Alt', 'CtrlOrMeta'],
    requireUrlFlag: false, // require URL param to show devtools
    urlFlag: 'tanstack-devtools', // the URL param name when requireUrlFlag is true
    theme: 'dark', // 'light' | 'dark' (defaults to system preference)
    triggerHidden: false, // completely hide trigger (hotkey still works)
  }}
/>
```

#### Event Bus Configuration

The `eventBusConfig` prop configures the client-side event bus that plugins use for communication:

```tsx
<TanStackDevtools
  eventBusConfig={{
    debug: false, // enable debug logging for the event bus
    connectToServerBus: false, // connect to the Vite plugin server event bus
    port: 3000, // port for server event bus connection
  }}
/>
```

The server event bus requires the `@tanstack/devtools-vite` plugin to be running.

#### Plugin Registration with defaultOpen

Each plugin entry can include a `defaultOpen` flag to control whether that plugin tab is active when devtools first opens:

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { FormDevtools } from '@tanstack/react-form'
;<TanStackDevtools
  config={{ hideUntilHover: true }}
  eventBusConfig={{ debug: true }}
  plugins={[
    {
      name: 'TanStack Form',
      render: <FormDevtools />,
      defaultOpen: true,
    },
  ]}
/>
```

#### Conditional Devtools with URL Flag

Use `requireUrlFlag` to hide devtools unless a specific URL parameter is present. This is useful for staging environments or team-internal debugging:

```tsx
<TanStackDevtools
  config={{
    requireUrlFlag: true,
    urlFlag: 'tanstack-devtools', // visit ?tanstack-devtools to enable
  }}
/>
```

### Common Mistakes

#### CRITICAL: Vue plugin uses `render` instead of `component`

The Vue adapter uses `component` (a Vue component reference) and optional `props`, not JSX `render`. Using `render` produces a silent failure -- the plugin tab appears but renders nothing.

Wrong:

```vue
<!-- This silently fails - render is ignored in Vue adapter -->
<script setup lang="ts">
const plugins = [{ name: 'My Plugin', render: MyComponent }]
</script>
```

Correct:

```vue
<script setup lang="ts">
import type { TanStackDevtoolsVuePlugin } from '@tanstack/vue-devtools'

const plugins: TanStackDevtoolsVuePlugin[] = [
  { name: 'My Plugin', component: MyComponent },
]
</script>
```

The `TanStackDevtoolsVuePlugin` type enforces this at compile time. Always import and use it.

#### HIGH: Vite plugin not placed first in plugins array

The `@tanstack/devtools-vite` plugin performs source injection that must run before framework plugins (React, Vue, Solid, etc.) process the code.

Wrong:

```ts
import { devtools } from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'

export default {
  plugins: [react(), devtools()],
}
```

Correct:

```ts
import { devtools } from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'

export default {
  plugins: [devtools(), react()],
}
```

#### HIGH: Mounting TanStackDevtools in SSR without client guard

The devtools core shell requires DOM APIs (`document`, `window`, `localStorage`). The React adapter includes `'use client'` at its entry point, so standard Next.js/Remix setups work. However, custom SSR setups or frameworks that do not respect the `'use client'` directive need explicit guards.

Wrong:

```tsx
// In a server-rendered component without framework 'use client' support
import { TanStackDevtools } from '@tanstack/react-devtools'

export default function Layout({ children }) {
  return (
    <>
      {children}
      <TanStackDevtools />
    </>
  )
}
```

Correct:

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'

export default function Layout({ children }) {
  return (
    <>
      {children}
      {typeof window !== 'undefined' && <TanStackDevtools />}
    </>
  )
}
```

Or use dynamic imports / lazy loading to ensure the component only loads on the client.

#### MEDIUM: Installing as regular dependency for dev-only use

When using the Vite plugin for production stripping, devtools packages should be dev dependencies. Installing them as regular dependencies increases production bundle size unnecessarily.

Wrong:

```bash
npm install @tanstack/react-devtools
```

Correct:

```bash
npm install -D @tanstack/react-devtools
npm install -D @tanstack/devtools-vite
```

Exception: if you intentionally want devtools in production, install `@tanstack/devtools` (core) as a regular dependency. See the production skill for details.

#### MEDIUM: Not keeping devtools packages at latest versions

All `@tanstack/devtools-*` packages share internal protocols (event bus messages, plugin mount lifecycle). Mixing versions can cause silent failures where plugins register but never receive events, or the shell mounts but plugins do not render.

Always update all devtools packages together:

```bash
npm install -D @tanstack/react-devtools@latest @tanstack/devtools-vite@latest
```

When building custom plugins, ensure `@tanstack/devtools-event-client` matches the version of `@tanstack/devtools` used by the shell.

### See Also

- **devtools-vite-plugin** -- Vite plugin configuration: source inspection, console piping, production stripping, server event bus setup
- **devtools-production** -- Production build handling: keeping devtools in prod, tree-shaking, URL flag gating
- **devtools-plugin-panel** -- Building custom plugin panels with the EventClient API

<a id="source-tanstack-devtools-production"></a>

## Devtools Production

Source: `tanstack-devtools-production`.

## TanStack Devtools Production Handling

> **Prerequisite:** Read the **devtools-app-setup** skill first. The initial setup decisions (framework adapter, Vite plugin, dependency type) directly determine which production strategy applies.

### How Production Stripping Works

TanStack Devtools has two independent mechanisms for keeping devtools out of production bundles. Understanding both is essential because they serve different project types.

#### Mechanism 1: Vite Plugin Auto-Stripping (Vite projects)

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

#### Mechanism 2: Conditional Exports (package.json)

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

### The Two Workflows

#### Development-Only Workflow (Default, Recommended)

This is the standard path from **devtools-app-setup**. Devtools are present during `vite dev` and stripped automatically on `vite build`.

**Install as dev dependencies:**

```bash
npm install -D @tanstack/react-devtools @tanstack/devtools-vite
```

**Vite config -- default behavior:**

```ts
import { devtools } from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    devtools(), // removeDevtoolsOnBuild defaults to true
    react(),
  ],
}
```

**Application code -- no guards needed:**

```tsx
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

The Vite plugin handles everything. The import and JSX are removed from the production build. Since the packages are dev dependencies, they are not even available in a production `node_modules` after `npm install --production`.

#### Production Workflow (Intentional)

When you deliberately want devtools accessible in a deployed application. This requires three changes from the default setup.

**1. Install as regular dependencies (not `-D`):**

```bash
npm install @tanstack/react-devtools @tanstack/devtools-vite
```

This ensures the packages are available in production `node_modules`.

**2. Disable auto-stripping in the Vite config:**

```ts
import { devtools } from '@tanstack/devtools-vite'
import react from '@vitejs/plugin-react'

export default {
  plugins: [
    devtools({
      removeDevtoolsOnBuild: false,
    }),
    react(),
  ],
}
```

**3. Application code remains the same:**

```tsx
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

With `removeDevtoolsOnBuild: false`, the Vite build plugin skips the AST stripping pass entirely, so all devtools code ships to production.

You can combine this with `requireUrlFlag` from the shell config to hide the devtools UI unless a URL parameter is present:

```tsx
<TanStackDevtools
  config={{
    requireUrlFlag: true,
    urlFlag: 'debug', // visit ?debug to show devtools
  }}
  plugins={
    [
      /* ... */
    ]
  }
/>
```

### Non-Vite Projects

Without the Vite plugin, there is no automatic stripping. You must manually prevent devtools from entering production bundles using one of these strategies.

#### Strategy A: Conditional Dynamic Import

Create a separate file for devtools setup, then conditionally import it:

```tsx
// devtools-setup.tsx
import { TanStackDevtools } from '@tanstack/react-devtools'

export default function Devtools() {
  return (
    <TanStackDevtools
      plugins={
        [
          // your plugins
        ]
      }
    />
  )
}
```

```tsx
// App.tsx
const Devtools =
  process.env.NODE_ENV === 'development'
    ? (await import('./devtools-setup')).default
    : () => null

function App() {
  return (
    <>
      <YourApp />
      <Devtools />
    </>
  )
}
```

When `NODE_ENV` is `'production'`, bundlers eliminate the dead `import()` path. The devtools-setup module and all its transitive dependencies are never included in the bundle.

#### Strategy B: Bundler-Specific Dead Code Elimination

For bundlers that support define/replace plugins (webpack `DefinePlugin`, esbuild `define`, Rollup `@rollup/plugin-replace`), wrap the import in a condition that the bundler can statically evaluate:

```tsx
// webpack example with DefinePlugin
let DevtoolsComponent: React.ComponentType = () => null

if (__DEV__) {
  const { TanStackDevtools } = await import('@tanstack/react-devtools')
  DevtoolsComponent = () => (
    <TanStackDevtools
      plugins={
        [
          /* ... */
        ]
      }
    />
  )
}

function App() {
  return (
    <>
      <YourApp />
      <DevtoolsComponent />
    </>
  )
}
```

The key requirement is that the condition must be statically resolvable by the bundler. `process.env.NODE_ENV === 'development'` works for most bundlers. Framework-specific globals like `__DEV__` also work.

### NoOp Plugin Variants for Tree-Shaking

When building reusable plugin packages with `@tanstack/devtools-utils`, the factory functions return a `[Plugin, NoOpPlugin]` tuple. The `NoOpPlugin` renders an empty fragment and carries no real dependencies. This is the primary mechanism for library authors to make their plugins tree-shakable.

```tsx
import { createReactPlugin } from '@tanstack/devtools-utils/react'

const [QueryPlugin, QueryNoOpPlugin] = createReactPlugin({
  name: 'TanStack Query',
  Component: ({ theme }) => <QueryDevtoolsPanel theme={theme} />,
})

// The library exports both, and consumers choose:
export { QueryPlugin, QueryNoOpPlugin }
```

Consumer code uses the NoOp variant in production:

```tsx
import { QueryPlugin, QueryNoOpPlugin } from '@tanstack/query-devtools'

const ActivePlugin =
  process.env.NODE_ENV === 'development' ? QueryPlugin : QueryNoOpPlugin

function App() {
  return <TanStackDevtools plugins={[ActivePlugin()]} />
}
```

The NoOp pattern exists for every framework adapter:

| Framework     | Factory              | Source                                          |
| ------------- | -------------------- | ----------------------------------------------- |
| React         | `createReactPlugin`  | `packages/devtools-utils/src/react/plugin.tsx`  |
| React (panel) | `createReactPanel`   | `packages/devtools-utils/src/react/panel.tsx`   |
| Preact        | `createPreactPlugin` | `packages/devtools-utils/src/preact/plugin.tsx` |
| Solid         | `createSolidPlugin`  | `packages/devtools-utils/src/solid/plugin.tsx`  |
| Vue           | `createVuePlugin`    | `packages/devtools-utils/src/vue/plugin.ts`     |

All return `readonly [Plugin, NoOpPlugin]`. The `NoOpPlugin` always has the same metadata (`name`, `id`, `defaultOpen`) but its render function produces an empty fragment, so the bundler can tree-shake the real panel component and all its dependencies.

See the **devtools-framework-adapters** skill for the full factory API details.

### Common Mistakes

#### HIGH: Keeping devtools in production without disabling stripping

The Vite plugin's `removeDevtoolsOnBuild` defaults to `true`. If you want devtools in production, you must both disable stripping AND install as a regular dependency. Missing either step causes failure.

**Wrong -- devtools stripped despite wanting them in production:**

```ts
// vite.config.ts
export default {
  plugins: [
    devtools(), // removeDevtoolsOnBuild defaults to true -- code is stripped
    react(),
  ],
}
```

```bash
# package.json has devtools as devDependency
npm install -D @tanstack/react-devtools
```

**Correct -- both changes together:**

```ts
// vite.config.ts
export default {
  plugins: [devtools({ removeDevtoolsOnBuild: false }), react()],
}
```

```bash
# regular dependency so it's available in production node_modules
npm install @tanstack/react-devtools
```

Missing `removeDevtoolsOnBuild: false` causes the AST stripping to remove all devtools imports and JSX at build time. Missing the regular dependency means `node_modules` may not contain the package in production environments that prune dev dependencies.

#### HIGH: Non-Vite projects not excluding devtools manually

Without the Vite plugin, devtools code is never automatically stripped. If you import `TanStackDevtools` unconditionally, the entire devtools shell and all plugin panels ship to production.

**Wrong -- always imports devtools regardless of environment:**

```tsx
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

**Correct -- conditional import based on NODE_ENV:**

```tsx
const Devtools =
  process.env.NODE_ENV === 'development'
    ? (await import('./devtools-setup')).default
    : () => null

function App() {
  return (
    <>
      <YourApp />
      <Devtools />
    </>
  )
}
```

The conditional must be statically evaluable by your bundler so it can eliminate the dead branch. Using a separate file for the devtools setup ensures the entire module subgraph is tree-shaken.

#### MEDIUM: Not using NoOp variants in plugin libraries

When building a reusable plugin package, exporting only the `Plugin` function (ignoring the `NoOpPlugin` from the tuple) means consumers have no lightweight alternative for production builds.

**Wrong -- NoOp variant discarded:**

```tsx
const [MyPlugin] = createReactPlugin({
  name: 'Store Inspector',
  Component: StoreInspectorPanel,
})

export { MyPlugin }
```

**Correct -- both variants exported:**

```tsx
const [MyPlugin, MyNoOpPlugin] = createReactPlugin({
  name: 'Store Inspector',
  Component: StoreInspectorPanel,
})

export { MyPlugin, MyNoOpPlugin }
```

Consumers then choose the appropriate variant based on their environment. Without the NoOp export, the only way to exclude the plugin is to not import the package at all, which requires the conditional-import pattern at the application level.

### Design Tension

Development convenience pulls toward automatic stripping (dev dependencies, Vite plugin handles everything). Production usage pulls toward explicit inclusion (regular dependencies, disabled stripping, URL flag gating). These two paths are mutually exclusive in their dependency and configuration choices. A project must commit to one path. Attempting to mix them -- for example, keeping devtools as a dev dependency while setting `removeDevtoolsOnBuild: false` -- leads to builds that fail silently when the production environment prunes dev dependencies.

For staging/preview environments where you want devtools but not in the final production deployment, use `requireUrlFlag` with the development-only workflow intact, rather than switching to the production workflow.

### Cross-References

- **devtools-app-setup** -- Initial setup decisions (framework, install command, Vite plugin placement) that this skill builds on.
- **devtools-vite-plugin** -- The `removeDevtoolsOnBuild` option and AST stripping logic live in the Vite plugin. See that skill for all Vite plugin configuration.
- **devtools-framework-adapters** -- The `[Plugin, NoOpPlugin]` tuple pattern and all framework-specific factory APIs.

### Key Source Files

- `packages/devtools-vite/src/plugin.ts` -- Vite plugin entry, `removeDevtoolsOnBuild` option, sub-plugin registration
- `packages/devtools-vite/src/remove-devtools.ts` -- AST-based stripping logic (oxc-parser + MagicString)
- `packages/devtools/package.json` -- Conditional exports (`browser.development` -> `dev.js`, `browser` -> `index.js`, `node`/`workerd` -> `server.js`)
- `packages/devtools/tsup.config.ts` -- Build config producing `dev.js`, `index.js`, `server.js` via `tsup-preset-solid`
- `packages/devtools-utils/src/react/plugin.tsx` -- `createReactPlugin` returning `[Plugin, NoOpPlugin]`
- `packages/devtools-utils/src/react/panel.tsx` -- `createReactPanel` returning `[Panel, NoOpPanel]`

<a id="source-tanstack-devtools-vite-plugin"></a>

## Devtools Vite Plugin

Source: `tanstack-devtools-vite-plugin`.

Configure @tanstack/devtools-vite -- the Vite plugin that enhances TanStack Devtools with source inspection, console piping, enhanced logging, a server event bus, production stripping, editor integration, and a plugin marketplace. The plugin returns an array of sub-plugins, all using `enforce: 'pre'`, so it must be the FIRST plugin in the Vite config.

### Installation and Basic Setup

```ts
// vite.config.ts
import { devtools } from '@tanstack/devtools-vite'

export default {
  plugins: [
    devtools(),
    // ... other plugins AFTER devtools
  ],
}
```

Install as a dev dependency:

```sh
pnpm add -D @tanstack/devtools-vite
```

There is also a `defineDevtoolsConfig` helper for type-safe config objects:

```ts
import { devtools, defineDevtoolsConfig } from '@tanstack/devtools-vite'

const config = defineDevtoolsConfig({
  // fully typed options
})

export default {
  plugins: [devtools(config)],
}
```

### Exports

From `packages/devtools-vite/src/index.ts`:

- `devtools` -- main plugin factory, returns `Array<Plugin>`
- `defineDevtoolsConfig` -- identity function for type-safe config
- `TanStackDevtoolsViteConfig` -- config type (re-exported)
- `ConsoleLevel` -- `'log' | 'warn' | 'error' | 'info' | 'debug'`

### Architecture: Sub-Plugins

`devtools()` returns an array of Vite plugins. Each has `enforce: 'pre'` and only activates when its conditions are met (dev mode, serve command, etc.).

| Sub-plugin name                               | What it does                                                                                                       | When active                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `@tanstack/devtools:inject-source`            | AST transform adding `data-tsd-source` attrs to JSX                                                                | dev mode + `injectSource.enabled`                          |
| `@tanstack/devtools:config`                   | Reserved for future config modifications                                                                           | serve command only                                         |
| `@tanstack/devtools:custom-server`            | Starts ServerEventBus, registers middleware for open-source/console-pipe endpoints                                 | dev mode                                                   |
| `@tanstack/devtools:remove-devtools-on-build` | Strips devtools imports/JSX from production bundles                                                                | build command or production mode + `removeDevtoolsOnBuild` |
| `@tanstack/devtools:event-client-setup`       | Marketplace: listens for install/add-plugin events via devtoolsEventClient                                         | dev mode + serve + not CI                                  |
| `@tanstack/devtools:console-pipe-transform`   | Injects runtime console-pipe code into entry files                                                                 | dev mode + serve + `consolePiping.enabled`                 |
| `@tanstack/devtools:better-console-logs`      | AST transform prepending source location to `console.log`/`console.error`                                          | dev mode + `enhancedLogs.enabled`                          |
| `@tanstack/devtools:inject-plugin`            | Detects which file imports TanStackDevtools (for marketplace injection)                                            | dev mode + serve                                           |
| `@tanstack/devtools:connection-injection`     | Replaces `__TANSTACK_DEVTOOLS_PORT__`, `__TANSTACK_DEVTOOLS_HOST__`, `__TANSTACK_DEVTOOLS_PROTOCOL__` placeholders | dev mode + serve                                           |

### Subsystem Details

#### Source Injection

Adds `data-tsd-source="<relative-path>:<line>:<column>"` attributes to every JSX opening element via oxc-parser + MagicString. This powers the "Go to Source" feature -- hold the inspect hotkey (default: Shift+Alt+Ctrl/Meta), hover over elements, click to open in editor.

**Key behaviors:**

- Skips `<Fragment>` and `<React.Fragment>`
- Skips elements where the component's props parameter is spread (`{...props}`) -- this is because injecting the attribute would be overwritten by the spread
- Skips files matching `injectSource.ignore.files` patterns
- Skips components matching `injectSource.ignore.components` patterns
- Patterns can be strings (matched via picomatch) or RegExp
- Transform filter excludes `node_modules`, `?raw` imports, `/dist/`, `/build/`

**Source files:** `packages/devtools-vite/src/inject-source.ts`, `packages/devtools-vite/src/matcher.ts`

```ts
devtools({
  injectSource: {
    enabled: true,
    ignore: {
      files: ['node_modules', /.*\.test\.(js|ts|jsx|tsx)$/],
      components: ['InternalComponent', /.*Provider$/],
    },
  },
})
```

#### Console Piping

Bidirectional console piping between client and server. Injects runtime code (IIFE) into entry files that:

**Client side:**

1. Wraps `console[level]` to batch and POST entries to `/__tsd/console-pipe`
2. Opens an EventSource on `/__tsd/console-pipe/sse` to receive server logs
3. Server logs appear in browser console with a purple `[Server]` prefix
4. Client logs appear in terminal with a cyan `[Client]` prefix

**Server side (SSR/Nitro):**

1. Wraps `console[level]` to batch and POST entries to `<viteServerUrl>/__tsd/console-pipe/server`
2. These are then broadcast to all SSE clients

**Entry file detection:** looks for `<html` tag, `StartClient`, `hydrateRoot`, `createRoot`, or `solid-js/web` + `render(` in code.

**Source files:** `packages/devtools-vite/src/virtual-console.ts`, `packages/devtools-vite/src/utils.ts` (middleware handlers)

```ts
devtools({
  consolePiping: {
    enabled: true,
    levels: ['log', 'warn', 'error', 'info', 'debug'],
  },
})
```

#### Enhanced Logging

AST transform that prepends source location info to `console.log()` and `console.error()` calls. In the browser, this renders as a clickable "Go to Source" link. On the server, it shows `LOG <path>:<line>:<column>` in chalk colors.

The transform inserts a spread of a conditional expression: `...(typeof window === 'undefined' ? serverLogMessage : browserLogMessage)` as the first argument of the console call.

**Source file:** `packages/devtools-vite/src/enhance-logs.ts`

```ts
devtools({
  enhancedLogs: {
    enabled: true, // default
  },
})
```

#### Production Stripping

Removes all devtools code from production builds. The transform:

1. Finds files importing from these packages: `@tanstack/react-devtools`, `@tanstack/preact-devtools`, `@tanstack/solid-devtools`, `@tanstack/vue-devtools`, `@tanstack/devtools`
2. Removes the import declarations
3. Removes the JSX elements that use the imported components
4. Cleans up leftover imports that were only used inside the removed JSX (e.g., plugin panel components)

Active when: `command !== 'serve'` OR `config.mode === 'production'` (handles hosting providers like Cloudflare/Netlify that may not use `build` command but set mode to production).

**Source file:** `packages/devtools-vite/src/remove-devtools.ts`

```ts
devtools({
  removeDevtoolsOnBuild: true, // default
})
```

#### Server Event Bus

A WebSocket + SSE server for devtools-to-client communication. Managed by `@tanstack/devtools-event-bus/server`.

**Key behaviors:**

- Default port: 4206
- On EADDRINUSE: falls back to OS-assigned port (port 0)
- When Vite uses HTTPS: piggybacks on Vite's httpServer instead of creating a standalone one (shares TLS certificate)
- Uses global variables (`__TANSTACK_DEVTOOLS_SERVER__`, etc.) to survive HMR without restarting
- The actual port is injected into client code via `__TANSTACK_DEVTOOLS_PORT__` placeholder replacement

**Source file:** `packages/event-bus/src/server/server.ts`

```ts
devtools({
  eventBusConfig: {
    port: 4206, // default
    enabled: true, // default; set false for storybook/vitest
    debug: false, // default; logs internal bus activity
  },
})
```

#### Editor Integration

Uses `launch-editor` to open source files in the editor. Default editor is VS Code. The `editor.open` callback receives `(path, lineNumber, columnNumber)` as strings.

The open-source flow: browser requests `/__tsd/open-source?source=<encoded-path:line:col>` --> Vite middleware parses source param --> calls `editor.open`.

Supported editors via launch-editor: VS Code, WebStorm, Sublime Text, Atom, and more. For unsupported editors, provide a custom `editor.open` function.

**Source file:** `packages/devtools-vite/src/editor.ts`

```ts
devtools({
  editor: {
    name: 'Cursor',
    open: async (path, lineNumber, columnNumber) => {
      // Custom editor open logic
      // path is the absolute file path
      // lineNumber and columnNumber are strings or undefined
    },
  },
})
```

#### Plugin Marketplace

When the dev server is running, listens for events via `devtoolsEventClient`:

- `install-devtools` -- runs package manager install, then auto-injects plugin into devtools setup file
- `add-plugin-to-devtools` -- injects plugin import and JSX/function call into the file containing `<TanStackDevtools>`
- `bump-package-version` -- updates a package to a minimum version
- `mounted` -- sends package.json and outdated deps to the UI

Auto-detection of the devtools setup file: the `inject-plugin` sub-plugin scans transforms for files importing from `@tanstack/react-devtools`, `@tanstack/solid-devtools`, `@tanstack/vue-devtools`, etc., and stores the file ID.

**Source files:** `packages/devtools-vite/src/inject-plugin.ts`, `packages/devtools-vite/src/package-manager.ts`

### Common Mistakes

#### 1. Not placing devtools() first in Vite plugins (HIGH)

All sub-plugins use `enforce: 'pre'`. They must transform code before framework plugins (React, Vue, Solid, etc.) process it. If devtools is not first, source injection and enhanced logs may silently fail because framework transforms remove the raw JSX before devtools can annotate it.

```ts
// WRONG
export default {
  plugins: [
    react(),
    devtools(), // too late -- react() already transformed JSX
  ],
}

// CORRECT
export default {
  plugins: [devtools(), react()],
}
```

#### 2. Using devtools-vite with non-Vite bundlers (HIGH)

`@tanstack/devtools-vite` has a peer dependency on `vite ^6.0.0 || ^7.0.0`. It uses Vite-specific APIs (`configureServer`, `handleHotUpdate`, `transform` with filter objects, `Plugin` type). It will not work with webpack, rspack, esbuild, or other bundlers. For non-Vite setups, use `@tanstack/devtools-event-bus` client directly without the Vite plugin.

#### 3. Expecting Vite plugin features in production (MEDIUM)

Source injection, console piping, enhanced logging, the server event bus, and the marketplace only operate during development (`config.mode === 'development'` and `command === 'serve'`). In production builds, the only active sub-plugin is `remove-devtools-on-build` (which strips devtools code). Do not rely on any of these features being available at runtime in production.

#### 4. Source injection on spread-props elements (MEDIUM)

The AST transform in `inject-source.ts` explicitly skips any JSX element that has a `{...props}` spread where `props` is the component's parameter name. This is intentional -- the spread would overwrite the injected `data-tsd-source` attribute. If source inspection doesn't work for a specific component, check if it spreads its props parameter.

```tsx
// data-tsd-source will NOT be injected on <div> here
const MyComponent = (props) => {
  return <div {...props}>content</div>
}
```

#### 5. Event bus port conflict in multi-project setups (MEDIUM)

The default event bus port is 4206. When running multiple Vite dev servers concurrently (monorepo), the second server will hit EADDRINUSE. The event bus handles this by falling back to an OS-assigned port (port 0), and the actual port is injected via placeholder replacement. However, if you need predictable ports (e.g., for firewall rules), set different ports explicitly:

```ts
// Project A
devtools({ eventBusConfig: { port: 4206 } })

// Project B
devtools({ eventBusConfig: { port: 4207 } })
```

### Internal Middleware Endpoints

These are registered on the Vite dev server (not the event bus server):

| Endpoint                                    | Method | Purpose                                                   |
| ------------------------------------------- | ------ | --------------------------------------------------------- |
| `/__tsd/open-source?source=<path:line:col>` | GET    | Opens file in editor, returns HTML that closes the window |
| `/__tsd/console-pipe`                       | POST   | Receives client console entries (batched JSON)            |
| `/__tsd/console-pipe/server`                | POST   | Receives server-side console entries                      |
| `/__tsd/console-pipe/sse`                   | GET    | SSE stream for broadcasting server logs to browser        |

### Cross-References

- **devtools-app-setup** -- How to set up `<TanStackDevtools>` in your app (must be done before the Vite plugin provides value)
- **devtools-production** -- Details on production stripping configuration and keeping devtools in production builds

### Key Source Files

- `packages/devtools-vite/src/plugin.ts` -- Main plugin factory with all sub-plugins and config type
- `packages/devtools-vite/src/inject-source.ts` -- AST transform for data-tsd-source injection
- `packages/devtools-vite/src/enhance-logs.ts` -- AST transform for enhanced console logs
- `packages/devtools-vite/src/remove-devtools.ts` -- Production stripping transform
- `packages/devtools-vite/src/virtual-console.ts` -- Console pipe runtime code generator
- `packages/devtools-vite/src/editor.ts` -- Editor config type and launch-editor integration
- `packages/devtools-vite/src/inject-plugin.ts` -- Marketplace plugin injection into devtools setup file
- `packages/devtools-vite/src/utils.ts` -- Middleware request handling and helpers
- `packages/devtools-vite/src/matcher.ts` -- Picomatch/RegExp pattern matcher
- `packages/event-bus/src/server/server.ts` -- ServerEventBus implementation (WebSocket + SSE + EADDRINUSE fallback)
