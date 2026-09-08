# Devtools Production — The Two Workflows

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## The Two Workflows

### Development-Only Workflow (Default, Recommended)

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

### Production Workflow (Intentional)

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
