# Custom Adapter — Common Mistakes

[Guide and prerequisites](./tanstack-db-core-custom-adapter-3b9cb5f2.md) · Published skill · `@tanstack/db@0.9.0`.

## Common Mistakes

### CRITICAL Defining loadSubset beside sync()

Wrong:

```ts
sync: {
  sync: ({ markReady }) => markReady(),
  loadSubset: async () => fetch('/items').then((response) => response.json()),
}
```

Correct: return `{ loadSubset, cleanup }` from `sync()` and apply loaded rows
with the sync transaction primitives, as shown above. Add `unloadSubset` when
each loaded subset owns a resource that must be released.

### CRITICAL Not calling markReady() in sync implementation

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

If initial sync fails before it produces a usable snapshot, call
`markError(error)` instead. This rejects readiness waits with the supplied cause
and moves dependent live queries to the error state. Calling `markError()`
without a cause remains supported and rejects with a generic collection-state
error. A later successful sync can call `markReady()` to recover.

Source: docs/guides/collection-options-creator.md

### HIGH Race condition: subscribing after initial fetch

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

### HIGH write() called without begin()

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

### HIGH Inserting a different value for an existing synced key

An `insert` for an existing synced key is normalized to an update only when
the value is unchanged. A different value throws `DuplicateKeySyncError`,
including for plain custom configs with no `utils`.

Emit an `update`, or delete/truncate the old row before inserting the new one.
