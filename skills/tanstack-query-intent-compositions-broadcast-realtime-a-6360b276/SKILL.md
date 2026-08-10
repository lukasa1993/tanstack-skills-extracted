---
name: tanstack-query-intent-compositions-broadcast-realtime-a-6360b276
description: "Use this when synchronizing TanStack Query caches with broadcastQueryClient, BroadcastChannel, multi-tab cache sync, realtime invalidation, WebSocket events, server/browser boundaries, and experimental broadcast behavior."
license: "MIT"
metadata:
  tanstack-library: "TanStack Query"
  tanstack-library-version: "5.101.0"
  tanstack-package: "@tanstack/query-intent"
  tanstack-package-version: "5.101.0"
  tanstack-requires: "[\"tanstack-query-intent-lifecycle-setup-query-client-and-providers\",\"tanstack-query-intent-core-write-mutations-and-invalida-1820d5b8\",\"tanstack-query-intent-compositions-persist-offline-and-ca66cce0\"]"
  tanstack-source-ref: "github:TanStack/query@bdfb2605d0c598a8446b612e715200829b035d49#packages/query-intent"
  tanstack-source-skill: "compositions/broadcast-realtime-and-multi-tab-synchronization"
  tanstack-sources: "[\"TanStack/query:docs/framework/react/plugins/broadcastQueryClient.md\",\"TanStack/query:docs/framework/react/guides/query-invalidation.md\",\"TanStack/query:examples/react/chat/package.json\"]"
  tanstack-type: "composition"
---

## Setup

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export const queryClient = new QueryClient()

if (typeof window !== 'undefined') {
  broadcastQueryClient({ queryClient, broadcastChannel: 'app-query-cache' })
}
```

## Core Integration Patterns

### Invalidate from realtime events

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function onTodoChanged(todoId: number) {
  return queryClient.invalidateQueries({ queryKey: ['todo', todoId] })
}
```

### Update narrow cache slices

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function onTodoTitle(todo: { id: number; title: string }) {
  queryClient.setQueryData(['todo', todo.id], todo)
}
```

### Keep broadcast client-side

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export function installBroadcast(queryClient: QueryClient) {
  if (typeof window === 'undefined') return
  broadcastQueryClient({ queryClient, broadcastChannel: 'query-cache' })
}
```

## Common Mistakes

### MEDIUM Unlocked experimental broadcast

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

broadcastQueryClient({ queryClient: new QueryClient() })
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

if (typeof window !== 'undefined') {
  broadcastQueryClient({
    queryClient: new QueryClient(),
    broadcastChannel: 'query-cache-v1',
  })
}
```

The broadcast package is experimental and should be deliberately isolated behind browser-only setup.

Source: TanStack/query:docs/framework/react/plugins/broadcastQueryClient.md

### MEDIUM Over-normalized realtime writes

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.setQueryData(['todos'], { byId: { 1: { id: 1 } }, allIds: [1] })
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()
queryClient.invalidateQueries({ queryKey: ['todos'] })
```

Query is not a normalized cache; invalidation is often safer than duplicating server state models.

Source: TanStack/query:docs/framework/react/guides/query-invalidation.md

### HIGH Broadcast on server

Wrong:

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export const queryClient = new QueryClient()
broadcastQueryClient({ queryClient })
```

Correct:

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export const queryClient = new QueryClient()
if (typeof window !== 'undefined') broadcastQueryClient({ queryClient })
```

BroadcastChannel is a browser primitive; server setup should not install it.

Source: TanStack/query:docs/framework/react/plugins/broadcastQueryClient.md
