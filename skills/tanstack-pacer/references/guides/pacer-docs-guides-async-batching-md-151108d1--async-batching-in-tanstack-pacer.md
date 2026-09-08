# Async Batching — Async Batching in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Batching in TanStack Pacer

TanStack Pacer provides async batching through the `AsyncBatcher` class and the `asyncBatch` function. Unlike the synchronous version, the async batcher handles Promises and provides robust error handling capabilities.

### Basic Usage with `asyncBatch`

The `asyncBatch` function provides a simple way to create an async batching function:

```ts
import { asyncBatch } from '@tanstack/pacer'

const processAsyncBatch = asyncBatch<number>(
  async (items) => {
    // Process the batch asynchronously
    const results = await Promise.all(
      items.map(item => processApiCall(item))
    )
    return results
  },
  {
    maxSize: 3,
    wait: 2000,
    onSuccess: (results, batch, batcher) => {
      console.log('Batch completed successfully:', results)
      console.log('Processed batch:', batch)
      console.log('Total successes:', batcher.store.state.successCount)
    },
    onError: (error, batch, batcher) => {
      console.error('Batch failed:', error)
      console.log('Failed batch:', batch)
      console.log('Total errors:', batcher.store.state.errorCount)
    }
  }
)

// Add items to be batched
processAsyncBatch(1)
processAsyncBatch(2)
processAsyncBatch(3) // Triggers batch processing
```

> **Note:** When using React, prefer `useAsyncBatchedCallback` hook over the `asyncBatch` function for better integration with React's lifecycle and automatic cleanup.

### Advanced Usage with `AsyncBatcher` Class

For more control over async batch behavior, use the `AsyncBatcher` class directly:

```ts
import { AsyncBatcher } from '@tanstack/pacer'

const batcher = new AsyncBatcher<number>(
  async (items) => {
    // Process the batch asynchronously
    const results = await Promise.all(
      items.map(item => processApiCall(item))
    )
    return results
  },
  {
    maxSize: 5,
    wait: 3000,
    onSuccess: (results, batch, batcher) => {
      console.log('Batch succeeded:', results)
      console.log('Processed batch:', batch)
    },
    onError: (error, batch, batcher) => {
      console.error('Batch failed:', error)
      console.log('Failed batch:', batch)
    }
  }
)

// Access current state via TanStack Store
console.log(batcher.store.state.successCount) // Number of successful batch executions
console.log(batcher.store.state.errorCount) // Number of failed batch executions
console.log(batcher.store.state.isExecuting) // Whether a batch is currently executing
console.log(batcher.store.state.lastResult) // Result from most recent batch

// Add items to the batch
batcher.addItem(1)
batcher.addItem(2)

// Control batch execution
batcher.stop()  // Stop processing
batcher.start() // Resume processing
```
