# Offline — Configuration

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.1.4`.

## Configuration

```ts
interface OfflineConfig {
  collections: Record<string, Collection> // Collections for optimistic state restoration
  mutationFns: Record<string, OfflineMutationFn> // Named mutation functions
  storage?: StorageAdapter // Custom storage (default: auto-detect)
  maxConcurrency?: number // Parallel execution limit
  jitter?: boolean // Add jitter to retry delays
  shouldRetry?: (error: Error, retryCount: number) => boolean | undefined // Override retry decision
  beforeRetry?: (txs) => txs // Transform/filter before retry
  onUnknownMutationFn?: (name, tx) => void // Handle orphaned transactions
  onLeadershipChange?: (isLeader) => void // Leadership state callback
  onStorageFailure?: (diagnostic) => void // Storage probe failure callback
  leaderElection?: LeaderElection // Custom leader election
  onlineDetector?: OnlineDetector // Custom connectivity detection
}
```

### Custom storage adapter

```ts
interface StorageAdapter {
  get: (key: string) => Promise<string | null>
  set: (key: string, value: string) => Promise<void>
  delete: (key: string) => Promise<void>
  keys: () => Promise<Array<string>>
  clear: () => Promise<void>
}
```
