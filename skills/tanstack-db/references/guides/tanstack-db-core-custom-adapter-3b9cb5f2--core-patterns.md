# Custom Adapter — Core Patterns

[Guide and prerequisites](./tanstack-db-core-custom-adapter-3b9cb5f2.md) · Published skill · `@tanstack/db@0.8.7`.

## Core Patterns

### ChangeMessage format

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

### On-demand sync with loadSubset

```ts
import { parseLoadSubsetOptions } from '@tanstack/db'

syncMode: 'on-demand',
sync: {
  sync: ({ begin, write, commit, markReady, collection }) => {
    const stopSync = subscribeToBackendChanges()
    markReady()

    return {
      cleanup: stopSync,
      loadSubset: async (options) => {
        const { filters, sorts, limit } = parseLoadSubsetOptions(options)
        const items = await api.items.list({
          filters,
          sorts,
          limit,
          offset: options.offset,
          // Translate cursor.whereFrom/whereCurrent expressions for your API.
          cursor: translateCursorExpressions(options.cursor),
        })

        begin()
        for (const item of items) {
          const key = collection.config.getKey(item)
          write(
            collection.has(key)
              ? { type: 'update', key, value: item }
              : { type: 'insert', value: item },
          )
        }
        commit()
      },
    }
  },
  rowUpdateMode: 'full',
}
```

`sync()` returns the handlers in a `SyncConfigRes` object. `loadSubset()` must
write fetched rows through `begin()` → `write()` → `commit()` and resolve
`void` (or return `true` for an immediate synchronous result); it does not
return the fetched rows. `parseLoadSubsetOptions()` returns only `filters`,
`sorts`, and `limit`. Read `offset` and `cursor` from the original options.
`cursor` contains query expressions (`whereFrom` and `whereCurrent`), not an
opaque backend cursor; translate or combine those expressions for your API.
Return `unloadSubset` only when `loadSubset` creates an ongoing resource, such
as a per-subset server subscription, that must be released.
Ownership transfers to core only when `loadSubset` returns `true` or a promise.
If it throws synchronously after partial setup, release that partial resource
before throwing; core will not call `unloadSubset` for a request that never
returned. A must-refetch can call `loadSubset` again with the same options. Each
successful return is a fresh acquisition: core releases the previous
acquisition when its replacement returns, then releases the current one when
the demand ends.

### Managing optimistic state duration

Mutation handlers must not resolve until server changes have synced back to the collection. Five strategies:

1. **Refetch** (simplest): `await collection.utils.refetch()`
2. **Transaction ID**: return `{ txid }` and track via sync stream
3. **ID-based tracking**: await specific record ID appearing in sync stream
4. **Version/timestamp**: wait until sync stream catches up to mutation time
5. **Provider method**: `await backend.waitForPendingWrites()`

### Persisted sync metadata

The `metadata` API on the sync config allows adapters to store per-row and per-collection metadata that persists across sync transactions. This is useful for tracking resume tokens, cursors, LSNs, or other adapter-specific state.

The `metadata` object is available on the sync config argument alongside
`begin`, `write`, and `commit`. Core supplies it at runtime, but its public type
is optional, so strict TypeScript code must guard it or assert its presence.
Without persistence the metadata is in-memory only and does not survive
reloads. With persistence, it is durable across sessions.

```ts
sync: ({ begin, write, commit, markReady, markError, metadata }) => {
  if (!metadata) throw new Error('Sync metadata API is unavailable')

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

Row metadata writes are tied to the current transaction. Deleting a row also
deletes its metadata. An insert sets metadata from `message.metadata`. A
metadata-less insert deletes stale metadata unless `metadata.row.set()` already
queued an explicit value for that key in the same transaction; that queued
value wins.

Collection metadata writes staged before `truncate()` are preserved and commit atomically with the truncate transaction.

**Typical usage — resume token:**

```ts
sync: ({ begin, write, commit, markReady, metadata }) => {
  if (!metadata) throw new Error('Sync metadata API is unavailable')

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
  stream.on('initial-error', (error) => markError(error))
  return () => stream.close()
}
```

### Expression parsing for predicate push-down

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
