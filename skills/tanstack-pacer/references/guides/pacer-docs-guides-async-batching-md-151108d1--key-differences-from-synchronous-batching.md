# Async Batching — Key Differences from Synchronous Batching

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Key Differences from Synchronous Batching

### 1. Return Value Handling

Unlike the synchronous batcher which returns void, the async version allows you to capture and use the return value from your batch function:

```ts
const batcher = new AsyncBatcher<string>(
  async (items) => {
    const results = await processBatch(items)
    return results
  },
  {
    maxSize: 5,
    onSuccess: (results, batch, batcher) => {
      // Handle the returned results
      console.log('Batch results:', results)
      console.log('Processed batch:', batch)
    }
  }
)
```

### 2. Error Handling

The async batcher provides comprehensive error handling capabilities:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might throw an error
    const results = await riskyBatchOperation(items)
    return results
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      // Handle batch errors
      console.error('Batch processing failed:', error)
      console.log('Items that failed:', batch)
      console.log('Total error count:', batcher.store.state.errorCount)
    },
    throwOnError: false, // Don't throw errors, just handle them
    onSuccess: (results, batch, batcher) => {
      console.log('Batch succeeded:', results)
      console.log('Processed batch:', batch)
      console.log('Total success count:', batcher.store.state.successCount)
    },
    onSettled: (batch, batcher) => {
      // Called after every batch (success or failure)
      console.log('Batch settled:', batch)
      console.log('Total batches:', batcher.store.state.settleCount)
    }
  }
)
```

### 3. Execution State Tracking

The async batcher tracks when batches are actively executing:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    console.log('Starting batch execution...')
    const results = await longRunningBatchOperation(items)
    console.log('Batch execution completed')
    return results
  },
  {
    maxSize: 5,
    onItemsChange: (batcher) => {
      console.log('Is executing:', batcher.store.state.isExecuting)
      console.log('Items in queue:', batcher.store.state.size)
    }
  }
)
```

### 4. Different Callbacks

The `AsyncBatcher` supports these async-specific callbacks:

- `onSuccess`: Called after each successful batch execution, providing the result, the batch of items processed, and batcher instance
- `onError`: Called when a batch execution fails, providing the error, the batch of items that failed, and batcher instance
- `onSettled`: Called after each batch execution (success or failure), providing the batch of items processed and batcher instance
- `onExecute`: Called after each batch execution, providing the batch of items processed and batcher instance (same as synchronous batcher)
- `onItemsChange`: Called when items are added or the batch is processed
