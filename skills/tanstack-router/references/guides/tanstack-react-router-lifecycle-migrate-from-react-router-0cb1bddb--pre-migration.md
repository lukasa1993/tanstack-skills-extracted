# Migrate From React Router — Pre-Migration

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

## Pre-Migration

- [ ] **Create a migration branch**

```bash
git checkout -b migrate-to-tanstack-router
```

- [ ] **Install TanStack Router alongside React Router temporarily**

```bash
npm install @tanstack/react-router @tanstack/react-router-devtools
npm install -D @tanstack/router-plugin
```

- [ ] **Configure bundler plugin (Vite example)**

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
  ],
})
```

- [ ] **Create routes directory**

```bash
mkdir src/routes
```
