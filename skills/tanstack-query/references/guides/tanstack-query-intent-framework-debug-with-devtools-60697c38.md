# Debug With Devtools

<a id="source-tanstack-query-intent-framework-debug-with-devtools"></a>

Draft guidance · `@tanstack/query-intent@5.101.0`.

This is unpublished draft guidance. Check APIs against the installed adapter and its release-matched documentation.

[Topic index](../frameworks-ui.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Setup Query Client And Providers](./tanstack-query-intent-lifecycle-setup-query-client-and-providers-72d53007.md).

This skill builds on `lifecycle/setup-query-client-and-providers`.

## Setup

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Devtools() {
  return <ReactQueryDevtools initialIsOpen={false} />
}
```

## Hooks and Components

### Lazy-load production devtools

```tsx
import * as React from 'react'

const ReactQueryDevtoolsProduction = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
)

export function LazyDevtools() {
  return (
    <React.Suspense fallback={null}>
      <ReactQueryDevtoolsProduction />
    </React.Suspense>
  )
}
```

### Embed a panel

```tsx
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'

export function DevtoolsPanel() {
  return <ReactQueryDevtoolsPanel />
}
```

### Use adapter-specific packages

```ts
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

export const devtools = { ReactQueryDevtools, VueQueryDevtools }
```

## Common Mistakes

### MEDIUM Eager production devtools

Wrong:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function AppDevtools() {
  return <ReactQueryDevtools />
}
```

Correct:

```tsx
import * as React from 'react'

const Devtools = React.lazy(() =>
  import('@tanstack/react-query-devtools/production').then((module) => ({
    default: module.ReactQueryDevtools,
  })),
)
export function AppDevtools() {
  return (
    <React.Suspense fallback={null}>
      <Devtools />
    </React.Suspense>
  )
}
```

Production devtools should be lazy-loaded from the production entry.

Source: TanStack/query:docs/framework/react/devtools.md

### MEDIUM Mock offline misconception

Wrong:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Devtools() {
  return <ReactQueryDevtools initialIsOpen />
}
```

Correct:

```ts
import { onlineManager } from '@tanstack/react-query'

export function setOfflineForTest() {
  onlineManager.setOnline(false)
}
```

Devtools inspect state; use Query managers or browser tooling to model network state.

Source: TanStack/query:docs/reference/onlineManager.md

### HIGH Devtools outside provider

Wrong:

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Root() {
  return <ReactQueryDevtools />
}
```

Correct:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()
export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools />
    </QueryClientProvider>
  )
}
```

Devtools need the same QueryClient context as the app.

Source: TanStack/query:docs/framework/react/devtools.md
