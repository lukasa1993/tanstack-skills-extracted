# Devtools Marketplace — PluginMetadata Interface

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## PluginMetadata Interface

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

### Required vs Optional Fields

Only two fields are strictly required by the TypeScript interface: `packageName`, `title`, and `framework`. In practice, always provide `requires`, `pluginImport`, and `description` -- without them the marketplace card is functional but auto-install cannot wire up the plugin.
