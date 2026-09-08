# Devtools Vite Plugin — Common Mistakes

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Common Mistakes

### 1. Not placing devtools() first in Vite plugins (HIGH)

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

### 2. Using devtools-vite with non-Vite bundlers (HIGH)

`@tanstack/devtools-vite` has a peer dependency on `vite ^6.0.0 || ^7.0.0`. It uses Vite-specific APIs (`configureServer`, `handleHotUpdate`, `transform` with filter objects, `Plugin` type). It will not work with webpack, rspack, esbuild, or other bundlers. For non-Vite setups, use `@tanstack/devtools-event-bus` client directly without the Vite plugin.

### 3. Expecting Vite plugin features in production (MEDIUM)

Source injection, console piping, enhanced logging, the server event bus, and the marketplace only operate during development (`config.mode === 'development'` and `command === 'serve'`). In production builds, the only active sub-plugin is `remove-devtools-on-build` (which strips devtools code). Do not rely on any of these features being available at runtime in production.

### 4. Source injection on spread-props elements (MEDIUM)

The AST transform in `inject-source.ts` explicitly skips any JSX element that has a `{...props}` spread where `props` is the component's parameter name. This is intentional -- the spread would overwrite the injected `data-tsd-source` attribute. If source inspection doesn't work for a specific component, check if it spreads its props parameter.

```tsx
// data-tsd-source will NOT be injected on <div> here
const MyComponent = (props) => {
  return <div {...props}>content</div>
}
```

### 5. Event bus port conflict in multi-project setups (MEDIUM)

The default event bus port is 4206. When running multiple Vite dev servers concurrently (monorepo), the second server will hit EADDRINUSE. The event bus handles this by falling back to an OS-assigned port (port 0), and the actual port is injected via placeholder replacement. However, if you need predictable ports (e.g., for firewall rules), set different ports explicitly:

```ts
// Project A
devtools({ eventBusConfig: { port: 4206 } })

// Project B
devtools({ eventBusConfig: { port: 4207 } })
```
