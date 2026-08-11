# Offline and integrations

Persistence, broadcast, realtime, and form integration.

<a id="source-tanstack-query-intent-compositions-broadcast-realtime-a-6360b276"></a>

## Broadcast Realtime And Multi Tab Synchronization

Source: `tanstack-query-intent-compositions-broadcast-realtime-a-6360b276`.

### Setup

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export const queryClient = new QueryClient()

if (typeof window !== 'undefined') {
  broadcastQueryClient({ queryClient, broadcastChannel: 'app-query-cache' })
}
```

### Core Integration Patterns

#### Invalidate from realtime events

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function onTodoChanged(todoId: number) {
  return queryClient.invalidateQueries({ queryKey: ['todo', todoId] })
}
```

#### Update narrow cache slices

```ts
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient()

export function onTodoTitle(todo: { id: number; title: string }) {
  queryClient.setQueryData(['todo', todo.id], todo)
}
```

#### Keep broadcast client-side

```ts
import { QueryClient } from '@tanstack/react-query'
import { broadcastQueryClient } from '@tanstack/query-broadcast-client-experimental'

export function installBroadcast(queryClient: QueryClient) {
  if (typeof window === 'undefined') return
  broadcastQueryClient({ queryClient, broadcastChannel: 'query-cache' })
}
```

### Common Mistakes

#### MEDIUM Unlocked experimental broadcast

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

#### MEDIUM Over-normalized realtime writes

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

#### HIGH Broadcast on server

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

<a id="source-tanstack-query-intent-compositions-persist-offline-and-ca66cce0"></a>

## Persist Offline And Restore Caches

Source: `tanstack-query-intent-compositions-persist-offline-and-ca66cce0`.

### Setup

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

### Core Integration Patterns

#### Resume paused mutations after restore

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

#### Align cache lifetime with persistence

```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { gcTime: 7 * 24 * 60 * 60 * 1000 },
  },
})
```

#### Use networkMode for offline-first writes

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

### Common Mistakes

#### HIGH gcTime shorter than maxAge

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

#### CRITICAL Rendering before restore

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

#### CRITICAL Missing default mutationFn

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

<a id="source-tanstack-query-intent-compositions-query-data-and-forms"></a>

## Query Data And Forms

Source: `tanstack-query-intent-compositions-query-data-and-forms`.

### Core Patterns

Treat form state as client state after the user starts editing. Server state can initialize the form, but it should not be copied blindly on every query update.

#### Initial data only

Use this when one user owns the form and background updates are not useful while editing.

```tsx
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

function PersonDetail({ id }: { id: string }) {
  const queryClient = useQueryClient()
  const person = useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchPerson(id),
    staleTime: Infinity,
  })

  const updatePerson = useMutation({
    mutationFn: savePerson,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['person', id] }),
  })

  if (!person.data) return <p>Loading...</p>
  return (
    <PersonForm
      person={person.data}
      isSaving={updatePerson.isPending}
      onSubmit={updatePerson.mutate}
    />
  )
}
```

#### Derived server plus client state

Use this when background updates should remain visible for untouched fields.

```tsx
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

function PersonName({ id }: { id: string }) {
  const { data } = useQuery({
    queryKey: ['person', id],
    queryFn: () => fetchPerson(id),
  })
  const [draft, setDraft] = React.useState<{ firstName?: string }>({})

  if (!data) return <p>Loading...</p>

  return (
    <input
      value={draft.firstName ?? data.firstName}
      onChange={(event) => setDraft({ firstName: event.target.value })}
    />
  )
}
```

#### Reset after awaited invalidation

```tsx
const mutation = useMutation({
  mutationFn: savePerson,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['person', id] }),
})

function submit(values: PersonFormValues) {
  mutation.mutate(values, { onSuccess: () => resetFormDraft() })
}
```

Return the invalidation promise from `onSuccess` or `onSettled` when the saved server state must be back in the cache before the form resets.

### Common Mistakes

#### HIGH Initializing form defaults before query data exists

Wrong:

```tsx
const { data } = useQuery({
  queryKey: ['person', id],
  queryFn: () => fetchPerson(id),
})
const [draft, setDraft] = React.useState(data)
```

Correct:

```tsx
const { data } = useQuery({
  queryKey: ['person', id],
  queryFn: () => fetchPerson(id),
})
if (!data) return <p>Loading...</p>
return <PersonForm initialPerson={data} />
```

The first render usually has no query data. Split the form boundary or derive field values from query data plus draft state.

Source: https://tkdodo.eu/blog/react-query-and-forms

#### HIGH Background refetch overwrites or hides dirty client state

Wrong:

```tsx
React.useEffect(() => {
  setDraft(personQuery.data)
}, [personQuery.data])
```

Correct:

```tsx
const shownFirstName = draft.firstName ?? personQuery.data?.firstName ?? ''
```

Do not synchronize every server update into the draft. Derive displayed values or intentionally opt out of background updates for initial-only forms.

Source: https://tkdodo.eu/blog/deriving-client-state-from-server-state

#### MEDIUM Form submit can run twice

Wrong:

```tsx
<button type="submit">Save</button>
```

Correct:

```tsx
<button type="submit" disabled={mutation.isPending}>
  Save
</button>
```

Use mutation state to block duplicate writes while a submission is in flight.

Source: https://tkdodo.eu/blog/react-query-and-forms
