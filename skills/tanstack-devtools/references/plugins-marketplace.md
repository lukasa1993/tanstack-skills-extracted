# Plugins and marketplace

Plugin panels, framework adapters, and marketplace use.

<a id="source-tanstack-devtools-marketplace"></a>

## Devtools Marketplace

Source: `tanstack-devtools-marketplace`.

## TanStack Devtools Marketplace

> **Prerequisite:** Build a working plugin first using the **devtools-plugin-panel** skill. The marketplace submission assumes you already have a published npm package that exports either a JSX panel component or a function-based plugin.

The TanStack Devtools Marketplace is a built-in registry inside the devtools shell. Users browse it from the Marketplace tab, and can install plugins with a single click. Submission is a PR to the `packages/devtools/src/tabs/plugin-registry.ts` file in the [TanStack/devtools](https://github.com/TanStack/devtools) repository.

### PluginMetadata Interface

Every marketplace entry conforms to the `PluginMetadata` interface exported from `packages/devtools/src/tabs/plugin-registry.ts`:

```ts
export interface PluginMetadata {
  /** Package name on npm (e.g., '@acme/react-analytics-devtools') */
  packageName: string

  /** Display title shown on the marketplace card */
  title: string

  /** Short description of what the plugin does */
  description?: string

  /** URL to a logo image (SVG, PNG, etc.) */
  logoUrl?: string

  /** Required base package dependency */
  requires?: {
    /** Required package name (e.g., '@tanstack/react-query') */
    packageName: string
    /** Minimum required version (semver) */
    minVersion: string
    /** Maximum version (if there's a known breaking change) */
    maxVersion?: string
  }

  /** Plugin import configuration -- enables one-click auto-install */
  pluginImport?: {
    /** The exact export name to import from the package
     *  (e.g., 'FormDevtoolsPlugin' or 'ReactQueryDevtoolsPanel') */
    importName: string
    /** 'jsx' = component rendered via { name, render: <Component /> }
     *  'function' = called directly as FnName() in the plugins array */
    type: 'jsx' | 'function'
  }

  /** Custom plugin ID for matching against registered plugins.
   *  The default behavior lowercases the package name and replaces
   *  non-alphanumeric characters with '-'.
   *  Example: pluginId: 'tanstack-form' matches 'tanstack-form-4'. */
  pluginId?: string

  /** URL to the plugin's documentation */
  docsUrl?: string

  /** Plugin author/maintainer */
  author?: string

  /** Repository URL */
  repoUrl?: string

  /** Framework this plugin supports */
  framework: 'react' | 'solid' | 'vue' | 'svelte' | 'angular' | 'other'

  /** Mark as featured -- appears in the Featured section with animated border.
   *  Reserved for official TanStack partners. */
  featured?: boolean

  /** Mark as new -- shows a "New" banner on the card */
  isNew?: boolean

  /** Tags for filtering and categorization */
  tags?: Array<string>
}
```

#### Required vs Optional Fields

Only two fields are strictly required by the TypeScript interface: `packageName`, `title`, and `framework`. In practice, always provide `requires`, `pluginImport`, and `description` -- without them the marketplace card is functional but auto-install cannot wire up the plugin.

### Registry Entry Examples

#### React Plugin (function-based)

A function-based plugin exports a factory function that returns a plugin object. The auto-injector calls it as `FormDevtoolsPlugin()` inside the `plugins` array:

```ts
// In packages/devtools/src/tabs/plugin-registry.ts

'@acme/react-analytics-devtools': {
  packageName: '@acme/react-analytics-devtools',
  title: 'Acme Analytics Devtools',
  description: 'Inspect analytics events, funnels, and session data',
  requires: {
    packageName: '@acme/react-analytics',
    minVersion: '2.0.0',
  },
  pluginImport: {
    importName: 'AnalyticsDevtoolsPlugin',
    type: 'function',
  },
  pluginId: 'acme-analytics',
  docsUrl: 'https://acme.dev/analytics/devtools',
  repoUrl: 'https://github.com/acme/analytics',
  author: 'Acme Corp',
  framework: 'react',
  isNew: true,
  tags: ['Analytics', 'Tracking'],
},
```

When a user clicks "Install" in the marketplace, the Vite plugin:

1. Runs the package manager to install `@acme/react-analytics-devtools`
2. Finds the file containing `<TanStackDevtools />`
3. Adds `import { AnalyticsDevtoolsPlugin } from '@acme/react-analytics-devtools'`
4. Injects `AnalyticsDevtoolsPlugin()` into the `plugins` array

#### React Plugin (JSX-based)

A JSX-based plugin exports a React component. The auto-injector wraps it in `{ name, render: <Component /> }`:

```ts
'@acme/react-state-devtools': {
  packageName: '@acme/react-state-devtools',
  title: 'Acme State Inspector',
  description: 'Real-time state tree visualization',
  requires: {
    packageName: '@acme/react-state',
    minVersion: '1.5.0',
  },
  pluginImport: {
    importName: 'AcmeStateDevtoolsPanel',
    type: 'jsx',
  },
  author: 'Acme Corp',
  framework: 'react',
  tags: ['State Management'],
},
```

The injected code looks like:

```tsx
import { AcmeStateDevtoolsPanel } from '@acme/react-state-devtools'
;<TanStackDevtools
  plugins={[
    { name: 'Acme State Inspector', render: <AcmeStateDevtoolsPanel /> },
  ]}
/>
```

#### Multi-Framework Submission (React + Solid)

When your devtools package supports multiple frameworks, add one entry per framework. Each entry is keyed by its own npm package name:

```ts
'@acme/react-analytics-devtools': {
  packageName: '@acme/react-analytics-devtools',
  title: 'Acme Analytics Devtools',
  description: 'Inspect analytics events, funnels, and session data',
  requires: {
    packageName: '@acme/react-analytics',
    minVersion: '2.0.0',
  },
  pluginImport: {
    importName: 'AnalyticsDevtoolsPlugin',
    type: 'function',
  },
  pluginId: 'acme-analytics',
  author: 'Acme Corp',
  framework: 'react',
  isNew: true,
  tags: ['Analytics', 'Tracking'],
},
'@acme/solid-analytics-devtools': {
  packageName: '@acme/solid-analytics-devtools',
  title: 'Acme Analytics Devtools',
  description: 'Inspect analytics events, funnels, and session data',
  requires: {
    packageName: '@acme/solid-analytics',
    minVersion: '2.0.0',
  },
  pluginImport: {
    importName: 'AnalyticsDevtoolsPlugin',
    type: 'function',
  },
  pluginId: 'acme-analytics',
  author: 'Acme Corp',
  framework: 'solid',
  isNew: true,
  tags: ['Analytics', 'Tracking'],
},
```

The marketplace auto-detects the user's framework from their `package.json` dependencies and shows only matching entries. Users can still browse other frameworks via the filter controls.

### How Auto-Install Works

The auto-install pipeline lives in `packages/devtools-vite/src/inject-plugin.ts`. Understanding it clarifies why `pluginImport` matters:

1. **Package installation** -- The Vite plugin detects the project's package manager and runs the appropriate install command.
2. **File detection** -- It scans project files for imports from `@tanstack/react-devtools`, `@tanstack/solid-devtools`, `@tanstack/vue-devtools`, etc.
3. **AST transformation** -- It parses the file with oxc-parser, finds the `<TanStackDevtools />` JSX element, and modifies the `plugins` prop via MagicString.
4. **Import insertion** -- It adds `import { <importName> } from '<packageName>'` after the last existing import.
5. **Plugin injection** -- Based on `pluginImport.type`:
   - `'function'`: Appends `ImportName()` directly to the plugins array
   - `'jsx'`: Appends `{ name: '<title>', render: <ImportName /> }` to the plugins array

If `pluginImport` is missing, step 3-5 are skipped entirely. The package gets installed but the user must manually wire it into the `plugins` prop.

### PR Submission Process

1. **Publish your package to npm.** The marketplace links to npm for installation; the package must be publicly available.

2. **Fork and clone** the [TanStack/devtools](https://github.com/TanStack/devtools) repository.

3. **Edit `packages/devtools/src/tabs/plugin-registry.ts`.** Add your entry to the `PLUGIN_REGISTRY` object under the `THIRD-PARTY PLUGINS` comment section:

   ```ts
   // ==========================================
   // THIRD-PARTY PLUGINS - Examples
   // ==========================================
   // External contributors can add their plugins below!
   ```

4. **Open a PR** against the `main` branch. Title format: `feat(marketplace): add <your-plugin-name>`.

5. **The PR will be reviewed** by TanStack maintainers. Common review feedback:
   - Missing `pluginImport` -- reviewers will ask you to add it
   - Missing `framework` -- required for marketplace filtering
   - Missing `requires.minVersion` -- avoids runtime errors for users on older versions
   - Incorrect `importName` -- must match the exact named export from your package

### Framework Detection

The marketplace determines the user's current framework by scanning their `package.json` dependencies for known framework packages:

| Framework | Detected packages    |
| --------- | -------------------- |
| react     | `react`, `react-dom` |
| solid     | `solid-js`           |
| vue       | `vue`, `@vue/core`   |
| svelte    | `svelte`             |
| angular   | `@angular/core`      |

Plugins with `framework: 'other'` are shown regardless of the detected framework.

### Featured Plugins

The `featured` field is reserved for official TanStack partners and select library authors. Featured plugins appear in a dedicated section at the top of the marketplace with an animated border.

To request featured status, email <partners+devtools@tanstack.com>.

Do not set `featured: true` in your PR submission -- it will be rejected. The TanStack team sets this flag.

### Plugin ID Matching

When the marketplace checks if a plugin is already active, it uses `pluginId` for matching. The matching logic in `packages/devtools/src/tabs/marketplace/plugin-utils.ts` does:

1. If `pluginId` is set, checks whether any registered plugin's ID starts with or contains the `pluginId` (case-insensitive).
2. Otherwise falls back to matching on `packageName` and extracting keyword segments.

Set a custom `pluginId` when your plugin registers with an ID that differs from the default (lowercased package name with non-alphanumeric characters replaced by `-`). For example, `@tanstack/react-form-devtools` registers as `tanstack-form-4` at runtime, so the registry entry uses `pluginId: 'tanstack-form'` to match it.

### Common Mistakes

#### HIGH: Missing pluginImport metadata for auto-install

Without `pluginImport.importName` and `pluginImport.type`, the marketplace auto-install pipeline installs the npm package but cannot inject the plugin into the user's code. The user sees a successful install but the plugin tab never appears -- they must manually add the import and wire it into the `plugins` prop.

Wrong -- no pluginImport:

```ts
'@acme/react-analytics-devtools': {
  packageName: '@acme/react-analytics-devtools',
  title: 'Acme Analytics Devtools',
  requires: {
    packageName: '@acme/react-analytics',
    minVersion: '2.0.0',
  },
  author: 'Acme Corp',
  framework: 'react',
},
```

Correct -- pluginImport provided:

```ts
'@acme/react-analytics-devtools': {
  packageName: '@acme/react-analytics-devtools',
  title: 'Acme Analytics Devtools',
  requires: {
    packageName: '@acme/react-analytics',
    minVersion: '2.0.0',
  },
  pluginImport: {
    importName: 'AnalyticsDevtoolsPlugin',
    type: 'function',
  },
  author: 'Acme Corp',
  framework: 'react',
},
```

The `importName` must be the exact named export from your package. The `type` must match how the export is consumed:

- `'function'` if your export is a factory like `export function AnalyticsDevtoolsPlugin() { return { name: '...', ... } }`
- `'jsx'` if your export is a component like `export function AnalyticsDevtoolsPanel() { return <div>...</div> }`

#### MEDIUM: Not specifying requires.minVersion

When `requires` is present but `minVersion` is omitted or set too low, users running older versions of the base package get runtime errors when the devtools plugin tries to access APIs that do not exist in their version.

Wrong -- missing minVersion:

```ts
requires: {
  packageName: '@acme/react-analytics',
},
```

This does not type-check -- `minVersion` is a required field inside `requires`. But setting it to `'0.0.0'` or an arbitrarily low version has the same practical effect: the marketplace shows the plugin as installable even when the user's version lacks the APIs your devtools plugin depends on.

Correct -- specify the actual minimum version your plugin is tested against:

```ts
requires: {
  packageName: '@acme/react-analytics',
  minVersion: '2.0.0',
},
```

If there is a known breaking change in a later version, also set `maxVersion`:

```ts
requires: {
  packageName: '@acme/react-analytics',
  minVersion: '2.0.0',
  maxVersion: '3.0.0',
},
```

The marketplace uses semver comparison (`packages/devtools/src/tabs/semver-utils.ts`) to determine if the user's installed version satisfies the range. When it does not, the card shows a "Bump Version" action instead of "Install".

#### MEDIUM: Submitting without framework field

The `framework` field enables marketplace filtering. Without it (or with it set incorrectly), users cannot find your plugin when browsing by framework, and the marketplace cannot determine whether to show it for the current project.

The framework is required by the TypeScript interface, so omitting it is a compile error. The real mistake is setting it to `'other'` when the plugin is framework-specific. A React-only plugin tagged `'other'` will appear for Solid, Vue, and Angular users who cannot use it.

Wrong:

```ts
framework: 'other', // but the plugin only works with React
```

Correct:

```ts
framework: 'react',
```

Use `'other'` only for truly framework-agnostic plugins that work in any environment.

### See Also

- **devtools-plugin-panel** -- Build a working devtools plugin panel before submitting to the marketplace
- **devtools-app-setup** -- TanStackDevtools component setup, plugins prop format, framework adapters

<a id="source-tanstack-devtools-plugin-panel"></a>

## Devtools Plugin Panel

Source: `tanstack-devtools-plugin-panel`.

### TanStackDevtoolsPlugin Interface

The low-level contract every plugin implements. Framework adapters wrap this automatically.

```ts
// Source: packages/devtools/src/context/devtools-context.tsx
interface TanStackDevtoolsPlugin {
  id?: string
  name: string | ((el: HTMLHeadingElement, theme: 'dark' | 'light') => void)
  render: (el: HTMLDivElement, theme: 'dark' | 'light') => void
  destroy?: (pluginId: string) => void
  defaultOpen?: boolean
}
```

- **`name`** (required) -- String tab title, or function receiving `(el, theme)` for custom rendering.
- **`render`** (required) -- Called on activation with a `<div>` container and theme. Called again on theme change.
- **`id`** (optional) -- Stable identifier. If omitted: `name.toLowerCase().replace(' ', '-')-{index}`. Explicit ids persist selection across reloads.
- **`defaultOpen`** (optional) -- Opens panel on first load when no saved state. Max 3 open. Does not override saved preferences.
- **`destroy`** (optional) -- Called on deactivation or unmount. Framework adapters handle cleanup automatically.

---

### Two Development Paths

#### Path 1: Solid.js Core + Framework Adapters (Multi-Framework)

Build the panel in Solid.js using `@tanstack/devtools-ui` components. Use `constructCoreClass` for lazy loading, then `createReactPanel`/`createSolidPanel` to wrap for each framework. The devtools core is Solid, so Solid panels run natively.

#### Path 2: Framework-Specific Panel (Single Framework)

Build directly in your framework and use `createReactPlugin`/`createVuePlugin`/`createSolidPlugin`/`createPreactPlugin` from `@tanstack/devtools-utils`.

---

### Path 1: Solid.js Core Panel

#### Step 1: Define Event Map and Create EventClient

```ts
// src/event-client.ts
import { EventClient } from '@tanstack/devtools-event-client'

type StoreEvents = {
  'state-changed': { storeName: string; state: unknown; timestamp: number }
  'action-dispatched': { storeName: string; action: string; payload: unknown }
  reset: void
}

class StoreInspectorClient extends EventClient<StoreEvents> {
  constructor() {
    super({ pluginId: 'store-inspector' })
  }
}

export const storeInspector = new StoreInspectorClient()
```

Event names are suffixes only. The `pluginId` is prepended automatically: `'store-inspector:state-changed'`.

#### Step 2: Build the Solid.js Panel Component

```tsx
/** @jsxImportSource solid-js */
import { createSignal, onCleanup, For } from 'solid-js'
import {
  MainPanel,
  Header,
  HeaderLogo,
  Section,
  SectionTitle,
  JsonTree,
  Button,
  Tag,
  createTheme,
} from '@tanstack/devtools-ui'
import { storeInspector } from './event-client'

export default function StoreInspectorPanel() {
  const { theme } = createTheme()
  const [state, setState] = createSignal<Record<string, unknown>>({})
  const [actions, setActions] = createSignal<
    Array<{ action: string; payload: unknown }>
  >([])

  const cleanupState = storeInspector.on('state-changed', (e) => {
    setState((prev) => ({ ...prev, [e.payload.storeName]: e.payload.state }))
  })
  const cleanupActions = storeInspector.on('action-dispatched', (e) => {
    setActions((prev) => [
      ...prev,
      { action: e.payload.action, payload: e.payload.payload },
    ])
  })

  onCleanup(() => {
    cleanupState()
    cleanupActions()
  })

  return (
    <MainPanel>
      <Header>
        <HeaderLogo flavor={{ light: '#1a1a2e', dark: '#e0e0e0' }}>
          Store Inspector
        </HeaderLogo>
      </Header>
      <Section>
        <SectionTitle>Current State</SectionTitle>
        <JsonTree value={state()} copyable defaultExpansionDepth={2} />
      </Section>
      <Section>
        <SectionTitle>
          Action Log
          <Tag color="purple" label="Actions" count={actions().length} />
        </SectionTitle>
        <For each={actions()}>
          {(a) => (
            <div>
              <strong>{a.action}</strong>
              <JsonTree value={a.payload} copyable defaultExpansionDepth={1} />
            </div>
          )}
        </For>
        <Button variant="danger" onClick={() => setActions([])}>
          Clear Log
        </Button>
      </Section>
    </MainPanel>
  )
}
```

#### Step 3: Create Core Class and Framework Adapters

```ts
// src/core.ts
import { constructCoreClass } from '@tanstack/devtools-utils/solid/class'

export const [StoreInspectorCore, NoOpStoreInspectorCore] = constructCoreClass(
  () => import('./panel'),
)
```

```tsx
// src/react.tsx
import { createReactPanel } from '@tanstack/devtools-utils/react'
import { StoreInspectorCore } from './core'

export const [StoreInspectorPanel, NoOpStoreInspectorPanel] =
  createReactPanel(StoreInspectorCore)
```

```tsx
// src/react-plugin.tsx
import { createReactPlugin } from '@tanstack/devtools-utils/react'
import { StoreInspectorPanel } from './react'

export const [StoreInspectorPlugin, NoOpStoreInspectorPlugin] =
  createReactPlugin({
    name: 'Store Inspector',
    id: 'store-inspector',
    defaultOpen: true,
    Component: StoreInspectorPanel,
  })
```

#### Step 4: Register

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { StoreInspectorPlugin } from 'your-package/react-plugin'

function App() {
  return (
    <>
      <YourApp />
      <TanStackDevtools plugins={[StoreInspectorPlugin()]} />
    </>
  )
}
```

---

### Path 2: Framework-Specific Panel (React Example)

```tsx
import { useState, useEffect } from 'react'
import { EventClient } from '@tanstack/devtools-event-client'
import { createReactPlugin } from '@tanstack/devtools-utils/react'

type MyEvents = {
  'data-update': { items: Array<{ id: string; value: number }> }
}

class MyPluginClient extends EventClient<MyEvents> {
  constructor() {
    super({ pluginId: 'my-plugin' })
  }
}

export const myPlugin = new MyPluginClient()

function MyPluginPanel({ theme }: { theme?: 'light' | 'dark' }) {
  const [items, setItems] = useState<Array<{ id: string; value: number }>>([])

  useEffect(() => {
    const cleanup = myPlugin.on('data-update', (e) => {
      setItems(e.payload.items)
    })
    return cleanup
  }, [])

  return (
    <div style={{ color: theme === 'dark' ? '#fff' : '#000' }}>
      <h3>My Plugin</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {item.id}: {item.value}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const [MyPlugin, NoOpMyPlugin] = createReactPlugin({
  name: 'My Plugin',
  id: 'my-plugin',
  defaultOpen: false,
  Component: MyPluginPanel,
})
```

---

### Plugin Lifecycle Sequence

1. **Initialization** -- `TanStackDevtoolsCore` receives `plugins` array. Each plugin gets an `id` (explicit or generated).
2. **DOM containers created** -- Core creates `<div id="plugin-container-{id}">` and `<h3 id="plugin-title-container-{id}">` per plugin.
3. **Activation** -- On tab click or `defaultOpen`, `plugin.render(container, theme)` called.
4. **Framework portaling** -- React uses `createPortal`, Solid uses `<Portal>`, Vue uses `<Teleport>`.
5. **Theme change** -- `render` called again with new theme value.
6. **Deactivation/Unmount** -- `destroy(pluginId)` called if provided. Framework adapters handle cleanup.

Active plugin selection persisted in `localStorage` under key `tanstack_devtools_state`.

---

### Common Mistakes

#### CRITICAL: Not Cleaning Up Event Listeners

Each `on()` returns a cleanup function. Forgetting it causes memory leaks and duplicate handlers.

Wrong:

```ts
useEffect(() => {
  client.on('state', cb)
}, [])
```

Correct:

```ts
useEffect(() => {
  const cleanup = client.on('state', cb)
  return cleanup
}, [])
```

In Solid, use `onCleanup()`:

```ts
const cleanup = storeInspector.on('state-changed', handler)
onCleanup(cleanup)
```

Source: docs/building-custom-plugins.md

#### HIGH: Oversubscribing to Events in Multiple Components

Do not call `on()` in multiple components for the same event. Subscribe once in a shared store/hook.

Wrong:

```ts
function ComponentA() {
  useEffect(() => {
    const c = client.on('state', cb1)
    return c
  }, [])
}
function ComponentB() {
  useEffect(() => {
    const c = client.on('state', cb2)
    return c
  }, [])
}
```

Correct:

```ts
function useStoreState() {
  const [state, setState] = useState(null)
  useEffect(() => {
    const cleanup = client.on('state', (e) => setState(e.payload))
    return cleanup
  }, [])
  return state
}
```

Source: maintainer interview

#### MEDIUM: Hardcoding Repeated Event Payload Fields

When emitting events that share common fields, create a shared base object.

Wrong:

```ts
client.emit('state-changed', { storeName: 'main', version: '1.0', state })
client.emit('action-dispatched', { storeName: 'main', version: '1.0', action })
```

Correct:

```ts
const base = { storeName: 'main', version: '1.0' }
client.emit('state-changed', { ...base, state })
client.emit('action-dispatched', { ...base, action })
```

Source: maintainer interview

#### MEDIUM: Ignoring Theme Prop in Panel Component

Panels must adapt styling to theme. Factory-created plugins receive `props.theme`.

Wrong:

```tsx
function MyPanel() {
  return <div style={{ color: 'white' }}>Always white text</div>
}
```

Correct:

```tsx
function MyPanel({ theme }: { theme?: 'light' | 'dark' }) {
  return (
    <div style={{ color: theme === 'dark' ? '#e0e0e0' : '#1a1a1a' }}>
      Theme-aware text
    </div>
  )
}
```

In Solid panels using devtools-ui, use `createTheme()` instead of prop drilling.

Source: docs/plugin-lifecycle.md

#### MEDIUM: Not Knowing Max 3 Active Plugins Limit

`MAX_ACTIVE_PLUGINS = 3` (in `packages/devtools/src/utils/constants.ts`). If more than 3 set `defaultOpen: true`, only the first 3 open. Activating a 4th deactivates the earliest. Single-plugin exception: if only 1 plugin is registered, it opens automatically.

Source: packages/devtools/src/utils/get-default-active-plugins.ts

#### MEDIUM: Using Raw DOM Manipulation Instead of Framework Portals

Framework adapters handle portaling. Do not manually manipulate DOM.

Wrong:

```ts
render: (el) => {
  const div = document.createElement('div')
  div.textContent = 'Hello'
  el.appendChild(div)
}
```

Correct:

```tsx
import { createReactPlugin } from '@tanstack/devtools-utils/react'
const [Plugin, NoOpPlugin] = createReactPlugin({
  name: 'My Plugin',
  Component: ({ theme }) => <div>Hello</div>,
})
```

Source: docs/plugin-lifecycle.md

#### MEDIUM: Not Keeping Devtools Packages at Latest Versions

All `@tanstack/devtools-*` packages should be on compatible versions. For external plugins, pin to compatible ranges.

Source: maintainer interview

### References

- [devtools-ui components and API](./assets/tanstack-devtools-plugin-panel/references/panel-api.md)

<a id="source-tanstack-devtools-utils-devtools-framework-adapters"></a>

## Devtools Framework Adapters

Source: `tanstack-devtools-utils-devtools-framework-adapters`.

Use `@tanstack/devtools-utils` factory functions to create per-framework devtools plugin adapters. Each framework has a subpath export (`/react`, `/vue`, `/solid`, `/preact`) with two factories:

1. **`createXPlugin`** -- wraps a component into a `[Plugin, NoOpPlugin]` tuple for tree-shaking.
2. **`createXPanel`** -- wraps a class-based devtools core (`mount`/`unmount`) into a `[Panel, NoOpPanel]` component tuple.

### Key Source Files

- `packages/devtools-utils/src/react/plugin.tsx` -- createReactPlugin
- `packages/devtools-utils/src/react/panel.tsx` -- createReactPanel, DevtoolsPanelProps
- `packages/devtools-utils/src/vue/plugin.ts` -- createVuePlugin (different API)
- `packages/devtools-utils/src/vue/panel.ts` -- createVuePanel, DevtoolsPanelProps (includes 'system' theme)
- `packages/devtools-utils/src/solid/plugin.tsx` -- createSolidPlugin
- `packages/devtools-utils/src/solid/panel.tsx` -- createSolidPanel
- `packages/devtools-utils/src/solid/class.ts` -- constructCoreClass (Solid-specific)
- `packages/devtools-utils/src/preact/plugin.tsx` -- createPreactPlugin
- `packages/devtools-utils/src/preact/panel.tsx` -- createPreactPanel

### Shared Pattern

All four frameworks follow the same two-factory pattern:

#### Plugin Factory

Every `createXPlugin` returns `readonly [Plugin, NoOpPlugin]`:

- **Plugin** -- returns a plugin object with metadata and a `render` function that renders your component.
- **NoOpPlugin** -- returns a plugin object with the same metadata but renders an empty fragment.

#### Panel Factory

Every `createXPanel` returns `readonly [Panel, NoOpPanel]`:

- **Panel** -- a framework component that creates a `<div style="height:100%">`, instantiates the core class, calls `core.mount(el, theme)` on mount, and `core.unmount()` on cleanup.
- **NoOpPanel** -- renders an empty fragment.

#### DevtoolsPanelProps

```ts
// React, Solid, Preact
interface DevtoolsPanelProps {
  theme?: 'light' | 'dark'
}

// Vue (note: includes 'system')
interface DevtoolsPanelProps {
  theme?: 'dark' | 'light' | 'system'
}
```

Import from the framework subpath:

```ts
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/react'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/vue'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/solid'
import type { DevtoolsPanelProps } from '@tanstack/devtools-utils/preact'
```

### Primary Example (React)

```tsx
import { createReactPlugin } from '@tanstack/devtools-utils/react'

function MyStorePanel({ theme }: { theme?: 'light' | 'dark' }) {
  return <div className={theme}>My Store Devtools</div>
}

const [MyPlugin, NoOpPlugin] = createReactPlugin({
  name: 'My Store',
  id: 'my-store',
  defaultOpen: false,
  Component: MyStorePanel,
})

// Tree-shaking: use NoOp in production
const ActivePlugin =
  process.env.NODE_ENV === 'development' ? MyPlugin : NoOpPlugin
```

#### With Class-Based Panel

```tsx
import {
  createReactPanel,
  createReactPlugin,
} from '@tanstack/devtools-utils/react'

class MyDevtoolsCore {
  mount(el: HTMLElement, theme: 'light' | 'dark') {
    /* render into el */
  }
  unmount() {
    /* cleanup */
  }
}

const [MyPanel, NoOpPanel] = createReactPanel(MyDevtoolsCore)

const [MyPlugin, NoOpPlugin] = createReactPlugin({
  name: 'My Store',
  Component: MyPanel,
})
```

### Framework API Differences

#### React & Preact -- Options Object

```ts
createReactPlugin({ name, id?, defaultOpen?, Component })  // => [Plugin, NoOpPlugin]
createPreactPlugin({ name, id?, defaultOpen?, Component }) // => [Plugin, NoOpPlugin]
```

- `Component` receives `DevtoolsPanelProps` (with `theme`).
- `Plugin()` returns `{ name, id?, defaultOpen?, render(el, theme) }`.
- Preact is identical to React but uses Preact JSX types and `preact/hooks`.

#### Vue -- Positional Arguments, NOT Options Object

```ts
createVuePlugin(name: string, component: DefineComponent) // => [Plugin, NoOpPlugin]
```

- Takes `(name, component)` as separate arguments, NOT an options object.
- `Plugin(props)` returns `{ name, component, props }` -- it passes props through.
- `NoOpPlugin(props)` returns `{ name, component: Fragment, props }`.
- Vue's `DevtoolsPanelProps.theme` also accepts `'system'`.

#### Solid -- Same API as React, Different Internals

```ts
createSolidPlugin({ name, id?, defaultOpen?, Component }) // => [Plugin, NoOpPlugin]
```

- Same options-object API as React.
- `Component` must be a Solid component function `(props: DevtoolsPanelProps) => JSX.Element`.
- The render function internally returns `<Component theme={theme} />` -- Solid handles reactivity.
- Solid also exports `constructCoreClass` from `@tanstack/devtools-utils/solid/class` for building lazy-loaded devtools cores.

### Common Mistakes

#### CRITICAL: Using React JSX Pattern in Vue Adapter

Vue uses positional `(name, component)` arguments, NOT an options object.

```ts
// WRONG -- will fail at compile time or produce garbage at runtime
const [MyPlugin, NoOpPlugin] = createVuePlugin({
  name: 'My Plugin',
  Component: MyPanel,
})

// CORRECT
const [MyPlugin, NoOpPlugin] = createVuePlugin('My Plugin', MyPanel)
```

Vue plugins also work differently at call time -- you pass props:

```ts
// WRONG -- calling Plugin() with no args (React pattern)
const plugin = MyPlugin()

// CORRECT -- Vue Plugin takes props
const plugin = MyPlugin({ theme: 'dark' })
```

#### CRITICAL: Solid Render Prop Not Wrapped in Function

When using Solid components, `Component` must be a function reference, not raw JSX.

```tsx
// WRONG -- evaluates immediately, breaks Solid reactivity
createSolidPlugin({
  name: 'My Store',
  Component: <MyPanel />, // This is JSX.Element, not a component function
})

// CORRECT -- pass the component function itself
createSolidPlugin({
  name: 'My Store',
  Component: (props) => <MyPanel theme={props.theme} />,
})

// ALSO CORRECT -- pass the component reference directly
createSolidPlugin({
  name: 'My Store',
  Component: MyPanel,
})
```

#### HIGH: Ignoring NoOp Variant for Production

The factory returns `[Plugin, NoOpPlugin]`. Both must be destructured and used for proper tree-shaking.

```tsx
// WRONG -- NoOp variant discarded, devtools code ships to production
const [MyPlugin] = createReactPlugin({ name: 'Store', Component: MyPanel })

// CORRECT -- conditionally use NoOp in production
const [MyPlugin, NoOpPlugin] = createReactPlugin({
  name: 'Store',
  Component: MyPanel,
})
const ActivePlugin =
  process.env.NODE_ENV === 'development' ? MyPlugin : NoOpPlugin
```

#### MEDIUM: Not Passing Theme Prop to Panel Component

`DevtoolsPanelProps` includes `theme`. The devtools shell passes it so panels can match light/dark mode. If your component ignores it, the panel will not adapt to theme changes.

```tsx
// WRONG -- theme is ignored
const Component = () => <div>My Panel</div>

// CORRECT -- use theme for styling
const Component = ({ theme }: DevtoolsPanelProps) => (
  <div className={theme === 'dark' ? 'dark-mode' : 'light-mode'}>My Panel</div>
)
```

### Design Tension

The core architecture is framework-agnostic, but each framework has different idioms:

- React/Preact use an options object with `Component` as a JSX function component.
- Vue uses positional arguments with a `DefineComponent` and passes props through.
- Solid uses the same options API as React but with Solid's JSX and reactivity model.

Agents trained on React patterns will get Vue wrong. Always check the import path to determine which factory API to use.

### Cross-References

- **devtools-plugin-panel** -- Build your panel component first, then wrap it with the appropriate framework adapter.
- **devtools-production** -- NoOp variants are the primary mechanism for stripping devtools from production bundles.

### Reference Files

- `references/react.md` -- Full React factory API and examples
- `references/vue.md` -- Full Vue factory API and examples (different from React)
- `references/solid.md` -- Full Solid factory API and examples
- `references/preact.md` -- Full Preact factory API and examples
