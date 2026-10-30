# Custom Adapter — Common Mistakes

[Guide and prerequisites](./tanstack-db-core-custom-adapter-3b9cb5f2.md) · Published skill · `@tanstack/db@1.0.0-rc.1`.

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

If initial sync fails before it produces a usable snapshot and you stop
retrying, call `fail(error)` instead. The status becomes `error`, readiness
waits reject with the supplied cause, and dependent live queries move to
`error`. A later `markReady()` in the same sync run does nothing; only a new
sync run can reach `ready`. Use `collection.reload()` to start a new sync run.

After the first `markReady()`, the rows stay. Report a sync problem with
`reportError(error)` while you keep trying; it sets the node's
`failureReason`. Call `reportHealthy()` when sync works again; it does nothing
when nothing is wrong. When you stop trying, call `fail(error)`: after
readiness the node shows an `error`, and only `reload()` clears it.
`reportError()` and `reportHealthy()` throw before the first `markReady()`.
Apps read these reports from `collection.health` and from each live query's
`health` tree. While a retry is in progress before readiness, report nothing.

A throwing `sync` function crashes the Collection (`status: 'crashed'`).
Reserve that for broken local state, not for network failures.

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
