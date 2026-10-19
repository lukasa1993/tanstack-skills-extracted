# Offline — Architecture

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.1.3`.

## Architecture

### Components

| Component               | Purpose                                     | Default                           |
| ----------------------- | ------------------------------------------- | --------------------------------- |
| **Storage**             | Persist transactions to survive page reload | IndexedDB → localStorage fallback |
| **OutboxManager**       | FIFO queue of pending transactions          | Automatic                         |
| **KeyScheduler**        | Serialize transactions touching same keys   | Automatic                         |
| **TransactionExecutor** | Execute with retry + backoff                | Automatic                         |
| **LeaderElection**      | Only one tab processes the outbox           | WebLocks → BroadcastChannel       |
| **OnlineDetector**      | Pause/resume on connectivity changes        | navigator.onLine + events         |

### Transaction lifecycle

1. Mutation applied optimistically to collection (instant UI update)
2. Transaction serialized and persisted to storage (outbox)
3. Leader tab picks up transaction and executes `mutationFn`
4. On success: removed from outbox, optimistic state resolved
5. On failure: retried with exponential backoff
6. On page reload: outbox replayed, optimistic state restored

### Leader election

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

### Storage degradation

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
