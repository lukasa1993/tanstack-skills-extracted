# Offline — Outbox Management

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.2.0`.

## Outbox Management

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
