# Devtools Vite Plugin — Installation and Basic Setup

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Installation and Basic Setup

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
