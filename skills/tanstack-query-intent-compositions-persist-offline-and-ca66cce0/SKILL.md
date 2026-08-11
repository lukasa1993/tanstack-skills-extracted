---
name: tanstack-query-intent-compositions-persist-offline-and-ca66cce0
description: "Use this when using persistQueryClient, PersistQueryClientProvider, createSyncStoragePersister, createAsyncStoragePersister, experimental fine-grained persisters, offline mutations, resumePausedMutations, maxAge, gcTime, and restore races."
license: "MIT"
metadata:
  internal: true
  tanstack-library: "TanStack Query"
  tanstack-library-version: "5.101.0"
  tanstack-package: "@tanstack/query-intent"
  tanstack-package-version: "5.101.0"
  tanstack-requires: "[\"tanstack-query-intent-lifecycle-setup-query-client-and-providers\",\"tanstack-query-intent-core-tune-defaults-freshness-retr-58e4e7c9\",\"tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8\"]"
  tanstack-source-ref: "github:TanStack/query@bdfb2605d0c598a8446b612e715200829b035d49#packages/query-intent"
  tanstack-source-skill: "compositions/persist-offline-and-restore-caches"
  tanstack-sources: "[\"TanStack/query:docs/framework/react/plugins/persistQueryClient.md\",\"TanStack/query:docs/framework/react/plugins/createSyncStoragePersister.md\",\"TanStack/query:docs/framework/react/plugins/createAsyncStoragePersister.md\",\"TanStack/query:docs/framework/react/plugins/createPersister.md\",\"TanStack/query:docs/framework/react/guides/network-mode.md\"]"
  tanstack-type: "composition"
---

## Setup

```tsx
import * as React from 'react'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 24 * 60 * 60 * 1000 } },
})

const persister = createSyncStoragePersister({
  storage: window.localStorage,
})

export function AppProviders(props: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {props.children}
    </PersistQueryClientProvider>
  )
}
```

## Core Integration Patterns

### Resume paused mutations after restore

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()

queryClient.setMutationDefaults(['todos'], {
  mutationFn: async (todo: { id: number; title: string }) => todo,
})

export function resumeMutations() {
  return queryClient.resumePausedMutations()
}
```

### Align cache lifetime with persistence

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 7 * 24 * 60 * 60 * 1000 },
  },
})
```

### Use networkMode for offline-first writes

```ts
import { useMutation } from '@tanstack/react-query'

export function useSaveDraft() {
  return useMutation({
    mutationKey: ['saveDraft'],
    mutationFn: async (draft: { body: string }) => draft,
    networkMode: 'offlineFirst',
  })
}
```

## Common Mistakes

### HIGH gcTime shorter than maxAge

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 5 * 60 * 1000 } },
})
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: 24 * 60 * 60 * 1000 } },
})
```

Persisted data can be garbage-collected before the persister maxAge can restore it.

Source: TanStack/query:docs/framework/react/plugins/persistQueryClient.md

### CRITICAL Rendering before restore

Wrong:

```tsx
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
export function App(props: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {props.children}
    </QueryClientProvider>
  )
}
```

Correct:

```tsx
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'

const queryClient = new QueryClient()
const persister = createSyncStoragePersister({ storage: window.localStorage })

export function App(props: { children: React.ReactNode }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {props.children}
    </PersistQueryClientProvider>
  )
}
```

The persistence provider prevents query fetching while restore is in progress.

Source: TanStack/query:docs/framework/react/plugins/persistQueryClient.md

### CRITICAL Missing default mutationFn

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient()
queryClient.setMutationDefaults(['saveDraft'], {
  mutationFn: async (draft: { body: string }) => draft,
})
```

Paused persisted mutations cannot resume without a serializable mutation key mapped to a default mutationFn.

Source: TanStack/query:docs/framework/react/plugins/persistQueryClient.md

See also: `core/tune-defaults-freshness-retries-and-refetching` for gcTime and networkMode.
