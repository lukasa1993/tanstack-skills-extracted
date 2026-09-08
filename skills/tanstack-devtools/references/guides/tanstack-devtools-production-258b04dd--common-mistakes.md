# Devtools Production — Common Mistakes

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Common Mistakes

### HIGH: Keeping devtools in production without disabling stripping

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

### HIGH: Non-Vite projects not excluding devtools manually

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

### MEDIUM: Not using NoOp variants in plugin libraries

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
