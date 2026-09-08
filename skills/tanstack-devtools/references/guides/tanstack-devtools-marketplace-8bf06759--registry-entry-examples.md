# Devtools Marketplace — Registry Entry Examples

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Registry Entry Examples

### React Plugin (function-based)

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

### React Plugin (JSX-based)

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

### Multi-Framework Submission (React + Solid)

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
