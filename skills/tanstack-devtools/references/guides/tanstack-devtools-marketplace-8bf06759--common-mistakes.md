# Devtools Marketplace — Common Mistakes

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Common Mistakes

### HIGH: Missing pluginImport metadata for auto-install

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

### MEDIUM: Not specifying requires.minVersion

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

### MEDIUM: Submitting without framework field

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
