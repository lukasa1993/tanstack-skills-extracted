# Devtools Production — Non-Vite Projects

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Non-Vite Projects

Without the Vite plugin, there is no automatic stripping. You must manually prevent devtools from entering production bundles using one of these strategies.

### Strategy A: Conditional Dynamic Import

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

### Strategy B: Bundler-Specific Dead Code Elimination

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
