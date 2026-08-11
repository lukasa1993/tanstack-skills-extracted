# Sync and persistence

Persistence, custom adapters, offline transactions, and Electric.

<a id="source-tanstack-db-core-custom-adapter"></a>

## Custom Adapter

Source: `tanstack-db-core-custom-adapter`.

This skill builds on db-core and db-core/collection-setup. Read those first.

## Custom Adapter Authoring

### Setup

```ts
import { createCollection } from '@tanstack/db'
import type { SyncConfig, CollectionConfig } from '@tanstack/db'

interface MyItem {
  id: string
  name: string
}

function myBackendCollectionOptions<T>(config: {
  endpoint: string
  getKey: (item: T) => string
}): CollectionConfig<T, string, {}> {
  return {
    getKey: config.getKey,
    sync: {
      sync: ({ begin, write, commit, markReady, metadata, collection }) => {
        let isInitialSyncComplete = false
        const bufferedEvents: Array<any> = []

        // 1. Subscribe to real-time events FIRST
        const unsubscribe = myWebSocket.subscribe(config.endpoint, (event) => {
          if (!isInitialSyncComplete) {
            bufferedEvents.push(event)
            return
          }
          begin()
          write({ type: event.type, key: event.id, value: event.data })
          commit()
        })

        // 2. Fetch initial data
        fetch(config.endpoint).then(async (res) => {
          const items = await res.json()
          begin()
          for (const item of items) {
            write({ type: 'insert', value: item })
          }
          commit()

          // 3. Process buffered events
          isInitialSyncComplete = true
          for (const event of bufferedEvents) {
            begin()
            write({ type: event.type, key: event.id, value: event.data })
            commit()
          }

          // 4. Signal readiness
          markReady()
        })

        // 5. Return cleanup function
        return () => {
          unsubscribe()
        }
      },
      rowUpdateMode: 'partial',
    },
    onInsert: async ({ transaction }) => {
      await fetch(config.endpoint, {
        method: 'POST',
        body: JSON.stringify(transaction.mutations[0].modified),
      })
    },
    onUpdate: async ({ transaction }) => {
      const mut = transaction.mutations[0]
      await fetch(`${config.endpoint}/${mut.key}`, {
        method: 'PATCH',
        body: JSON.stringify(mut.changes),
      })
    },
    onDelete: async ({ transaction }) => {
      await fetch(`${config.endpoint}/${transaction.mutations[0].key}`, {
        method: 'DELETE',
      })
    },
  }
}
```

### Core Patterns

#### ChangeMessage format

```ts
// Insert
write({ type: 'insert', value: item })

// Update (partial — only changed fields)
write({ type: 'update', key: itemId, value: partialItem })

// Update (full row replacement)
write({ type: 'update', key: itemId, value: fullItem })
// Set rowUpdateMode: "full" in sync config

// Delete
write({ type: 'delete', key: itemId, value: item })
```

#### On-demand sync with loadSubset

```ts
import { parseLoadSubsetOptions } from "@tanstack/db"

sync: {
  sync: ({ begin, write, commit, markReady }) => {
    // Initial sync...
    markReady()
    return () => {}
  },
  loadSubset: async (options) => {
    const { filters, sorts, limit, offset } = parseLoadSubsetOptions(options)
    // filters: [{ field: ['category'], operator: 'eq', value: 'electronics' }]
    // sorts:   [{ field: ['price'], direction: 'asc', nulls: 'last' }]
    const params = new URLSearchParams()
    for (const f of filters) {
      params.set(f.field.join("."), `${f.operator}:${f.value}`)
    }
    const res = await fetch(`/api/items?${params}`)
    return res.json()
  },
}
```

#### Managing optimistic state duration

Mutation handlers must not resolve until server changes have synced back to the collection. Five strategies:

1. **Refetch** (simplest): `await collection.utils.refetch()`
2. **Transaction ID**: return `{ txid }` and track via sync stream
3. **ID-based tracking**: await specific record ID appearing in sync stream
4. **Version/timestamp**: wait until sync stream catches up to mutation time
5. **Provider method**: `await backend.waitForPendingWrites()`

#### Persisted sync metadata

The `metadata` API on the sync config allows adapters to store per-row and per-collection metadata that persists across sync transactions. This is useful for tracking resume tokens, cursors, LSNs, or other adapter-specific state.

The `metadata` object is available as a property on the sync config argument alongside `begin`, `write`, `commit`, etc. It is always provided, but without persistence the metadata is in-memory only and does not survive reloads. With persistence, metadata is durable across sessions.

```ts
sync: ({ begin, write, commit, markReady, metadata }) => {
  // Row metadata: store per-row state (e.g. server version, ETag)
  metadata.row.get(key) // => unknown | undefined
  metadata.row.set(key, { version: 3, etag: 'abc' })
  metadata.row.delete(key)

  // Collection metadata: store per-collection state (e.g. resume cursor)
  metadata.collection.get('cursor') // => unknown | undefined
  metadata.collection.set('cursor', 'token_abc123')
  metadata.collection.delete('cursor')
  metadata.collection.list() // => [{ key: 'cursor', value: 'token_abc123' }]
  metadata.collection.list('resume') // filter by prefix
}
```

Row metadata writes are tied to the current transaction. When a row is deleted via `write({ type: 'delete', ... })`, its row metadata is automatically deleted. When a row is inserted, its metadata is set from `message.metadata` if provided, or deleted otherwise.

Collection metadata writes staged before `truncate()` are preserved and commit atomically with the truncate transaction.

**Typical usage — resume token:**

```ts
sync: ({ begin, write, commit, markReady, metadata }) => {
  const lastCursor = metadata.collection.get('cursor') as string | undefined

  const stream = subscribeFromCursor(lastCursor)
  stream.on('data', (batch) => {
    begin()
    for (const item of batch.items) {
      write({ type: item.type, key: item.id, value: item.data })
    }
    metadata.collection.set('cursor', batch.cursor)
    commit()
  })

  stream.on('ready', () => markReady())
  return () => stream.close()
}
```

#### Expression parsing for predicate push-down

```ts
import {
  parseWhereExpression,
  parseOrderByExpression,
  extractSimpleComparisons,
} from '@tanstack/db'

// In loadSubset or queryFn:
const comparisons = extractSimpleComparisons(options.where)
// Returns: [{ field: ['name'], operator: 'eq', value: 'John' }]

const orderBy = parseOrderByExpression(options.orderBy)
// Returns: [{ field: ['created_at'], direction: 'desc', nulls: 'last' }]
```

### Common Mistakes

#### CRITICAL Not calling markReady() in sync implementation

Wrong:

```ts
sync: ({ begin, write, commit }) => {
  fetchData().then((items) => {
    begin()
    items.forEach((item) => write({ type: 'insert', value: item }))
    commit()
    // forgot markReady()!
  })
}
```

Correct:

```ts
sync: ({ begin, write, commit, markReady }) => {
  fetchData().then((items) => {
    begin()
    items.forEach((item) => write({ type: 'insert', value: item }))
    commit()
    markReady()
  })
}
```

`markReady()` transitions the collection to "ready" status. Without it, live queries never resolve and `useLiveSuspenseQuery` hangs forever in Suspense.

Source: docs/guides/collection-options-creator.md

#### HIGH Race condition: subscribing after initial fetch

Wrong:

```ts
sync: ({ begin, write, commit, markReady }) => {
  fetchAll().then((data) => {
    writeAll(data)
    subscribe(onChange) // changes during fetch are LOST
    markReady()
  })
}
```

Correct:

```ts
sync: ({ begin, write, commit, markReady }) => {
  const buffer = []
  subscribe((event) => {
    if (!ready) {
      buffer.push(event)
      return
    }
    begin()
    write(event)
    commit()
  })
  fetchAll().then((data) => {
    writeAll(data)
    ready = true
    buffer.forEach((e) => {
      begin()
      write(e)
      commit()
    })
    markReady()
  })
}
```

Subscribe to real-time events before fetching initial data. Buffer events during the fetch, then replay them after the initial sync completes.

Source: docs/guides/collection-options-creator.md

#### HIGH write() called without begin()

Wrong:

```ts
onMessage((event) => {
  write({ type: event.type, key: event.id, value: event.data })
  commit()
})
```

Correct:

```ts
onMessage((event) => {
  begin()
  write({ type: event.type, key: event.id, value: event.data })
  commit()
})
```

Sync data must be written within a transaction (`begin` → `write` → `commit`). Calling `write()` without `begin()` throws `NoPendingSyncTransactionWriteError`.

Source: packages/db/src/collection/sync.ts:110

### Tension: Simplicity vs. Correctness in Sync

Getting-started simplicity (localOnly, eager mode) conflicts with production correctness (on-demand sync, race condition prevention, proper markReady handling). Agents optimizing for quick setup tend to skip buffering, markReady, and cleanup functions.

See also: ./collections-schema.md#source-tanstack-db-core-collection-setup — for built-in adapter patterns to model after.

<a id="source-tanstack-db-core-persistence"></a>

## Persistence

Source: `tanstack-db-core-persistence`.

This skill builds on db-core and db-core/collection-setup. Read those first.

## SQLite Persistence

TanStack DB persistence adds a durable SQLite-backed layer to any collection. Data survives page reloads, app restarts, and offline periods. The server remains authoritative for synced collections -- persistence provides a local cache that hydrates instantly.

### Choosing a Platform Package

| Platform       | Package                                                      | Create function                              |
| -------------- | ------------------------------------------------------------ | -------------------------------------------- |
| Browser (OPFS) | `@tanstack/browser-db-sqlite-persistence`                    | `createBrowserWASQLitePersistence`           |
| React Native   | `@tanstack/react-native-db-sqlite-persistence`               | `createReactNativeSQLitePersistence`         |
| Expo           | `@tanstack/expo-db-sqlite-persistence`                       | `createExpoSQLitePersistence`                |
| Electron       | `@tanstack/electron-db-sqlite-persistence`                   | `createElectronSQLitePersistence` (renderer) |
| Node.js        | `@tanstack/node-db-sqlite-persistence`                       | `createNodeSQLitePersistence`                |
| Capacitor      | `@tanstack/capacitor-db-sqlite-persistence`                  | `createCapacitorSQLitePersistence`           |
| Tauri          | `@tanstack/tauri-db-sqlite-persistence`                      | `createTauriSQLitePersistence`               |
| Cloudflare DO  | `@tanstack/cloudflare-durable-objects-db-sqlite-persistence` | `createCloudflareDOSQLitePersistence`        |

All platform packages re-export `persistedCollectionOptions` from the core.

### Local-Only Persistence (No Server)

For purely local data with no sync backend:

```ts
import { createCollection } from '@tanstack/react-db'
import {
  BrowserCollectionCoordinator,
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
  persistedCollectionOptions,
} from '@tanstack/browser-db-sqlite-persistence'

const database = await openBrowserWASQLiteOPFSDatabase({
  databaseName: 'my-app.sqlite',
})

const coordinator = new BrowserCollectionCoordinator({
  dbName: 'my-app',
})

const persistence = createBrowserWASQLitePersistence({
  database,
  coordinator,
})

const draftsCollection = createCollection(
  persistedCollectionOptions<Draft, string>({
    id: 'drafts',
    getKey: (d) => d.id,
    persistence,
    schemaVersion: 1,
  }),
)
```

Local-only collections provide `collection.utils.acceptMutations()` for applying mutations directly.

### Synced Persistence (Wrapping an Adapter)

Spread an existing adapter's options into `persistedCollectionOptions` to add persistence on top of sync:

```ts
import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'
import {
  createReactNativeSQLitePersistence,
  persistedCollectionOptions,
} from '@tanstack/react-native-db-sqlite-persistence'

const persistence = createReactNativeSQLitePersistence({ database })

const todosCollection = createCollection(
  persistedCollectionOptions({
    ...electricCollectionOptions({
      id: 'todos',
      shapeOptions: { url: '/api/electric/todos' },
      getKey: (item) => item.id,
    }),
    persistence,
    schemaVersion: 1,
  }),
)
```

This works with any adapter: `electricCollectionOptions`, `queryCollectionOptions`, `powerSyncCollectionOptions`, etc. The `persistedCollectionOptions` wrapper intercepts the sync layer to persist data as it flows through.

### Multi-Tab / Multi-Process Coordination

Coordinators handle leader election and cross-instance communication so only one tab/process owns the database writer.

| Platform                              | Coordinator                     | Mechanism                                      |
| ------------------------------------- | ------------------------------- | ---------------------------------------------- |
| Browser                               | `BrowserCollectionCoordinator`  | BroadcastChannel + Web Locks                   |
| Electron                              | `ElectronCollectionCoordinator` | IPC (main holds DB, renderer accesses via RPC) |
| Single-process (RN, Expo, Node, etc.) | `SingleProcessCoordinator`      | No-op (always leader)                          |

Browser example:

```ts
import { BrowserCollectionCoordinator } from '@tanstack/browser-db-sqlite-persistence'

const coordinator = new BrowserCollectionCoordinator({
  dbName: 'my-app',
})

// Pass to persistence
const persistence = createBrowserWASQLitePersistence({ database, coordinator })

// Cleanup on shutdown
coordinator.dispose()
```

Electron requires setup in both processes:

```ts
// Main process
import { exposeElectronSQLitePersistence } from '@tanstack/electron-db-sqlite-persistence'
exposeElectronSQLitePersistence({ persistence, ipcMain })

// Renderer process
import {
  createElectronSQLitePersistence,
  ElectronCollectionCoordinator,
} from '@tanstack/electron-db-sqlite-persistence'

const coordinator = new ElectronCollectionCoordinator({ dbName: 'my-app' })
const persistence = createElectronSQLitePersistence({
  ipcRenderer: window.electron.ipcRenderer,
  coordinator,
})
```

### Schema Versioning

`schemaVersion` tracks the shape of persisted data. When the stored version doesn't match the code, the collection resets (drops and reloads from server for synced collections, or throws for local-only).

```ts
persistedCollectionOptions({
  // ...
  schemaVersion: 2, // bump when you change the data shape
})
```

There is no custom migration function -- a version mismatch triggers a full reset. For synced collections this is safe because the server re-supplies the data.

### Key Options

| Option          | Type                             | Description                                              |
| --------------- | -------------------------------- | -------------------------------------------------------- |
| `persistence`   | `PersistedCollectionPersistence` | Platform adapter + coordinator                           |
| `schemaVersion` | `number`                         | Data version (default 1). Bump on schema changes         |
| `id`            | `string`                         | Required for local-only. Collection identifier in SQLite |

### Common Mistakes

#### CRITICAL Using local-only persistence without an `id`

Wrong:

```ts
persistedCollectionOptions({
  getKey: (d) => d.id,
  persistence,
  // missing id — generates random UUID each session, data won't persist across reloads
})
```

Correct:

```ts
persistedCollectionOptions({
  id: 'drafts',
  getKey: (d) => d.id,
  persistence,
})
```

Without an explicit `id`, the code generates a random UUID each session, so persisted data is silently abandoned on every reload. Local-only persisted collections must always provide an `id`. Synced collections derive it from the adapter config.

#### HIGH Forgetting the coordinator in multi-tab apps

Wrong:

```ts
const persistence = createBrowserWASQLitePersistence({ database })
// No coordinator — concurrent tabs corrupt the database
```

Correct:

```ts
const coordinator = new BrowserCollectionCoordinator({ dbName: 'my-app' })
const persistence = createBrowserWASQLitePersistence({ database, coordinator })
```

Without a coordinator, multiple browser tabs write to SQLite concurrently, causing data corruption. Always use `BrowserCollectionCoordinator` in browser environments.

#### HIGH Not bumping schemaVersion after changing data shape

If you add, remove, or rename fields in your collection type but keep the same `schemaVersion`, the persisted SQLite data will have the old shape. For synced collections, bump the version to trigger a reset and re-sync.

#### MEDIUM Not disposing the coordinator on cleanup

```ts
// On app shutdown or hot module reload
coordinator.dispose()
await database.close?.()
```

Failing to dispose leaks BroadcastChannel subscriptions and Web Lock handles.

See also: ./collections-schema.md#source-tanstack-db-core-collection-setup — for adapter selection and collection configuration.

See also: ./sync-persistence.md#source-tanstack-offline-transactions-offline — for offline transaction queueing (complements persistence).

<a id="source-tanstack-offline-transactions-offline"></a>

## Offline

Source: `tanstack-offline-transactions-offline`.

This skill builds on db-core and mutations-optimistic. Read those first.

## TanStack DB — Offline Transactions

### Setup

```ts
import {
  startOfflineExecutor,
  IndexedDBAdapter,
} from '@tanstack/offline-transactions'
import { todoCollection } from './collections'

const executor = startOfflineExecutor({
  collections: { todos: todoCollection },
  mutationFns: {
    createTodo: async ({ transaction, idempotencyKey }) => {
      const mutation = transaction.mutations[0]
      await api.todos.create({
        ...mutation.modified,
        idempotencyKey,
      })
    },
    updateTodo: async ({ transaction, idempotencyKey }) => {
      const mutation = transaction.mutations[0]
      await api.todos.update(mutation.key, {
        ...mutation.changes,
        idempotencyKey,
      })
    },
  },
})

// Wait for initialization (storage probe, leader election, outbox replay)
await executor.waitForInit()
```

### Core API

#### createOfflineTransaction

```ts
const tx = executor.createOfflineTransaction({
  mutationFnName: 'createTodo',
})

// Mutations run inside tx.mutate() — uses ambient transaction context
tx.mutate(() => {
  todoCollection.insert({ id: crypto.randomUUID(), text: 'New todo' })
})
tx.commit()
```

If the executor is not the leader tab, falls back to `createTransaction` directly (no offline persistence).

#### createOfflineAction

```ts
const addTodo = executor.createOfflineAction({
  mutationFnName: 'createTodo',
  onMutate: (variables) => {
    todoCollection.insert({
      id: crypto.randomUUID(),
      text: variables.text,
    })
  },
})

// Call it
addTodo({ text: 'Buy milk' })
```

If the executor is not the leader tab, falls back to `createOptimisticAction` directly.

### Architecture

#### Components

| Component               | Purpose                                     | Default                           |
| ----------------------- | ------------------------------------------- | --------------------------------- |
| **Storage**             | Persist transactions to survive page reload | IndexedDB → localStorage fallback |
| **OutboxManager**       | FIFO queue of pending transactions          | Automatic                         |
| **KeyScheduler**        | Serialize transactions touching same keys   | Automatic                         |
| **TransactionExecutor** | Execute with retry + backoff                | Automatic                         |
| **LeaderElection**      | Only one tab processes the outbox           | WebLocks → BroadcastChannel       |
| **OnlineDetector**      | Pause/resume on connectivity changes        | navigator.onLine + events         |

#### Transaction lifecycle

1. Mutation applied optimistically to collection (instant UI update)
2. Transaction serialized and persisted to storage (outbox)
3. Leader tab picks up transaction and executes `mutationFn`
4. On success: removed from outbox, optimistic state resolved
5. On failure: retried with exponential backoff
6. On page reload: outbox replayed, optimistic state restored

#### Leader election

Only one tab processes the outbox to prevent duplicate execution. Non-leader tabs use regular `createTransaction`/`createOptimisticAction` (online-only, no persistence).

```ts
const executor = startOfflineExecutor({
  // ...
  onLeadershipChange: (isLeader) => {
    console.log(
      isLeader
        ? 'This tab is processing offline transactions'
        : 'Another tab is leader',
    )
  },
})

executor.isOfflineEnabled // true only if leader AND storage available
```

#### Storage degradation

The executor probes storage availability on startup:

```ts
const executor = startOfflineExecutor({
  // ...
  onStorageFailure: (diagnostic) => {
    // diagnostic.code: 'STORAGE_BLOCKED' | 'QUOTA_EXCEEDED' | 'UNKNOWN_ERROR'
    // diagnostic.mode: 'online-only'
    console.warn(diagnostic.message)
  },
})

executor.mode // 'offline' | 'online-only'
executor.storageDiagnostic // Full diagnostic info
```

When storage is unavailable (private browsing, quota exceeded), the executor operates in online-only mode — mutations work normally but aren't persisted across page reloads.

### Configuration

```ts
interface OfflineConfig {
  collections: Record<string, Collection> // Collections for optimistic state restoration
  mutationFns: Record<string, OfflineMutationFn> // Named mutation functions
  storage?: StorageAdapter // Custom storage (default: auto-detect)
  maxConcurrency?: number // Parallel execution limit
  jitter?: boolean // Add jitter to retry delays
  beforeRetry?: (txs) => txs // Transform/filter before retry
  onUnknownMutationFn?: (name, tx) => void // Handle orphaned transactions
  onLeadershipChange?: (isLeader) => void // Leadership state callback
  onStorageFailure?: (diagnostic) => void // Storage probe failure callback
  leaderElection?: LeaderElection // Custom leader election
  onlineDetector?: OnlineDetector // Custom connectivity detection
}
```

#### Custom storage adapter

```ts
interface StorageAdapter {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  delete: (key: string) => Promise<void>
  keys: () => Promise<Array<string>>
  clear: () => Promise<void>
}
```

### Error Handling

#### NonRetriableError

```ts
import { NonRetriableError } from '@tanstack/offline-transactions'

const executor = startOfflineExecutor({
  mutationFns: {
    createTodo: async ({ transaction, idempotencyKey }) => {
      const res = await fetch('/api/todos', { method: 'POST', body: ... })
      if (res.status === 409) {
        throw new NonRetriableError('Duplicate detected')
      }
      if (!res.ok) throw new Error('Server error')
    },
  },
})
```

Throwing `NonRetriableError` stops retry and removes the transaction from the outbox. Use for permanent failures (validation errors, conflicts, 4xx responses).

#### Idempotency keys

Every offline transaction includes an `idempotencyKey`. Pass it to your API to prevent duplicate execution on retry:

```ts
mutationFns: {
  createTodo: async ({ transaction, idempotencyKey }) => {
    await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Idempotency-Key': idempotencyKey },
      body: JSON.stringify(transaction.mutations[0].modified),
    })
  },
}
```

### React Native

```ts
import {
  startOfflineExecutor,
} from '@tanstack/offline-transactions/react-native'

// Uses ReactNativeOnlineDetector automatically
// Uses AsyncStorage-compatible storage
const executor = startOfflineExecutor({ ... })
```

### Outbox Management

```ts
// Inspect pending transactions
const pending = await executor.peekOutbox()

// Get counts
executor.getPendingCount() // Queued transactions
executor.getRunningCount() // Currently executing

// Clear all pending transactions
await executor.clearOutbox()

// Cleanup
executor.dispose()
```

### Common Mistakes

#### CRITICAL Not passing idempotencyKey to the API

Wrong:

```ts
mutationFns: {
  createTodo: async ({ transaction }) => {
    await api.todos.create(transaction.mutations[0].modified)
  },
}
```

Correct:

```ts
mutationFns: {
  createTodo: async ({ transaction, idempotencyKey }) => {
    await api.todos.create({
      ...transaction.mutations[0].modified,
      idempotencyKey,
    })
  },
}
```

Offline transactions retry on failure. Without idempotency keys, retries can create duplicate records on the server.

#### HIGH Not waiting for initialization

Wrong:

```ts
const executor = startOfflineExecutor({ ... })
const tx = executor.createOfflineTransaction({ mutationFnName: 'createTodo' })
```

Correct:

```ts
const executor = startOfflineExecutor({ ... })
await executor.waitForInit()
const tx = executor.createOfflineTransaction({ mutationFnName: 'createTodo' })
```

`startOfflineExecutor` initializes asynchronously (probes storage, requests leadership, replays outbox). Creating transactions before initialization completes may miss the leader election result and use the wrong code path.

#### HIGH Missing collection in collections map

Wrong:

```ts
const executor = startOfflineExecutor({
  collections: {},
  mutationFns: { createTodo: ... },
})
```

Correct:

```ts
const executor = startOfflineExecutor({
  collections: { todos: todoCollection },
  mutationFns: { createTodo: ... },
})
```

The `collections` map is used to restore optimistic state from the outbox on page reload. Without it, previously pending mutations won't show their optimistic state while being replayed.

#### MEDIUM Not handling NonRetriableError for permanent failures

Wrong:

```ts
mutationFns: {
  createTodo: async ({ transaction }) => {
    const res = await fetch('/api/todos', { ... })
    if (!res.ok) throw new Error('Failed')
  },
}
```

Correct:

```ts
mutationFns: {
  createTodo: async ({ transaction }) => {
    const res = await fetch('/api/todos', { ... })
    if (res.status >= 400 && res.status < 500) {
      throw new NonRetriableError(`Client error: ${res.status}`)
    }
    if (!res.ok) throw new Error('Server error')
  },
}
```

Without distinguishing retriable from permanent errors, 4xx responses (validation, auth, not found) will retry forever until max retries, wasting resources and filling logs.

See also: ./mutations.md#source-tanstack-db-core-mutations-optimistic — for the underlying mutation primitives.

See also: ./collections-schema.md#source-tanstack-db-core-collection-setup — for setting up collections used with offline transactions.

<a id="source-tanstack-db-playbook-tanstack-db-electric"></a>

## Tanstack Db Electric

Source: `tanstack-db-playbook-tanstack-db-electric`.

## Electric Integration

Electric collections enable real-time sync between TanStack DB and Postgres via ElectricSQL. Data streams automatically from your database to the client, with optimistic mutations that confirm via transaction ID matching.

### Common Patterns

#### Basic Setup

```tsx
import { createCollection } from '@tanstack/react-db'
import { electricCollectionOptions } from '@tanstack/electric-db-collection'

const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    schema: todoSchema,
    getKey: (item) => item.id,

    shapeOptions: {
      url: '/api/todos', // Your Electric proxy
    },

    onInsert: async ({ transaction }) => {
      const newItem = transaction.mutations[0].modified
      const response = await api.todos.create(newItem)
      return { txid: response.txid }
    },

    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0]
      const response = await api.todos.update(original.id, changes)
      return { txid: response.txid }
    },

    onDelete: async ({ transaction }) => {
      const response = await api.todos.delete(
        transaction.mutations[0].original.id,
      )
      return { txid: response.txid }
    },
  }),
)
```

#### Txid Matching (Recommended)

Return txid from handlers to wait for sync confirmation:

```tsx
onInsert: async ({ transaction }) => {
  const response = await api.todos.create(transaction.mutations[0].modified)
  return { txid: response.txid } // Wait for this txid in Electric stream
}
```

**Backend txid extraction (Postgres):**

```typescript
async function createTodo(data: TodoInput, tx: Transaction) {
  // Query txid INSIDE the same transaction as the mutation
  const result = await tx.execute(
    sql`SELECT pg_current_xact_id()::xid::text as txid`,
  )
  const txid = parseInt(result.rows[0].txid, 10)

  await tx.execute(sql`INSERT INTO todos ${tx(data)}`)

  return { txid }
}
```

**Critical:** `pg_current_xact_id()` must be called INSIDE the same transaction as the mutation, not before or after.

#### Custom Match Functions

When txids aren't available, use custom matching:

```tsx
import { isChangeMessage } from '@tanstack/electric-db-collection'

onInsert: async ({ transaction, collection }) => {
  const newItem = transaction.mutations[0].modified
  await api.todos.create(newItem)

  // Wait for matching message in stream
  await collection.utils.awaitMatch(
    (message) => {
      return (
        isChangeMessage(message) &&
        message.headers.operation === 'insert' &&
        message.value.text === newItem.text
      )
    },
    5000, // timeout ms (optional, default 3000)
  )
}
```

#### Simple Timeout (Prototyping)

For quick prototyping when you're confident about timing:

```tsx
onInsert: async ({ transaction }) => {
  await api.todos.create(transaction.mutations[0].modified)
  await new Promise((resolve) => setTimeout(resolve, 2000))
}
```

#### Electric Proxy Setup

Electric should run behind a proxy for security and shape configuration:

```typescript
// TanStack Start example: routes/api/todos.ts
import { createServerFileRoute } from '@tanstack/react-start/server'
import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from '@electric-sql/client'

const ELECTRIC_URL = 'http://localhost:3000/v1/shape'

const serve = async ({ request }: { request: Request }) => {
  // Check user authorization here
  const url = new URL(request.url)
  const originUrl = new URL(ELECTRIC_URL)

  // Pass through Electric protocol params
  url.searchParams.forEach((value, key) => {
    if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
      originUrl.searchParams.set(key, value)
    }
  })

  // Set shape parameters (server-controlled, not client)
  originUrl.searchParams.set('table', 'todos')
  // originUrl.searchParams.set('where', 'user_id = $1')
  // originUrl.searchParams.set('columns', 'id,text,completed')

  const response = await fetch(originUrl)
  const headers = new Headers(response.headers)
  headers.delete('content-encoding')
  headers.delete('content-length')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

export const ServerRoute = createServerFileRoute('/api/todos').methods({
  GET: serve,
})
```

#### Custom Actions with Electric

```tsx
import { createOptimisticAction } from '@tanstack/react-db'

const addTodo = createOptimisticAction<{ text: string }>({
  onMutate: ({ text }) => {
    todoCollection.insert({
      id: crypto.randomUUID(),
      text,
      completed: false,
      created_at: new Date(),
    })
  },
  mutationFn: async ({ text }) => {
    const response = await api.todos.create({ text, completed: false })
    await todoCollection.utils.awaitTxId(response.txid)
  },
})
```

#### Utility Methods

```tsx
// Wait for specific transaction ID
await todoCollection.utils.awaitTxId(12345)
await todoCollection.utils.awaitTxId(12345, 10000) // with timeout

// Wait for custom match
await todoCollection.utils.awaitMatch(
  (message) => isChangeMessage(message) && message.value.id === '123',
  5000,
)

// Helper functions
import {
  isChangeMessage,
  isControlMessage,
} from '@tanstack/electric-db-collection'

isChangeMessage(message) // insert/update/delete
isControlMessage(message) // up-to-date/must-refetch
```

### Debugging

#### Enable Debug Logging

```javascript
// Browser console
localStorage.debug = 'ts/db:electric'
```

#### Common Issue: awaitTxId Stalls

**Symptom:** `awaitTxId` hangs forever, data persists but optimistic state never resolves.

**Cause:** Txid queried outside the mutation's transaction.

```
// Debug output showing mismatch:
ts/db:electric awaitTxId called with txid 124
ts/db:electric new txids synced from pg [123]  // ← 124 never arrives!

// Debug output when working:
ts/db:electric awaitTxId called with txid 123
ts/db:electric new txids synced from pg [123]
ts/db:electric awaitTxId found match for txid 123
```

**Fix:** Query `pg_current_xact_id()` INSIDE the same transaction:

```typescript
// ❌ WRONG
async function createTodo(data) {
  const txid = await generateTxId(sql) // Separate transaction!
  await sql.begin(async (tx) => {
    await tx`INSERT INTO todos ${tx(data)}`
  })
  return { txid } // Won't match!
}

// ✅ CORRECT
async function createTodo(data) {
  let txid: number
  await sql.begin(async (tx) => {
    txid = await generateTxId(tx) // Same transaction
    await tx`INSERT INTO todos ${tx(data)}`
  })
  return { txid }
}
```

### Shape Configuration

Shapes define what data syncs to the client:

| Parameter | Description                    | Example             |
| --------- | ------------------------------ | ------------------- |
| `table`   | Postgres table name            | `todos`             |
| `where`   | Row filter clause              | `user_id = $1`      |
| `columns` | Columns to sync (default: all) | `id,text,completed` |

**Important:** Configure shapes server-side in your proxy, not client-side, for security.

### Detailed References

| Reference                     | When to Use                                   |
| ----------------------------- | --------------------------------------------- |
| `references/txid-matching.md` | Transaction ID patterns, backend setup        |
| `references/shapes.md`        | Shape configuration, filtering, security      |
| `references/proxy-setup.md`   | Electric proxy patterns, authentication       |
| `references/debugging.md`     | Debug logging, common issues, troubleshooting |

<a id="source-tanstack-db-skills-tanstack-db-electric"></a>

Exact duplicate of `tanstack-db-playbook-tanstack-db-electric`; use the preceding canonical content.
