# Async Batching — Advanced Features: Retry and Abort Support

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Advanced Features: Retry and Abort Support

The async batcher includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

### Retry Support

Configure automatic retries for failed batch executions using the `asyncRetryerOptions`:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might fail due to network issues
    const results = await apiCall(items)
    return results
  },
  {
    maxSize: 5,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Abort Support

Cancel in-flight batch executions using the abort functionality:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // Access the abort signal for this execution
    const signal = batcher.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify(items),
        signal // Pass signal to fetch for cancellation support
      })
      return response.json()
    }
  },
  { maxSize: 10 }
)

// Add items
batcher.addItem(1)
batcher.addItem(2)

// Later, abort any in-flight batch executions
batcher.abort()
```

The abort functionality:
- Cancels all ongoing batch executions using AbortController
- Does NOT cancel pending batches that haven't started yet (use `cancel()` for that)
- Does NOT clear items from the batcher
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your batch function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Sharing Options Between Instances

Use `asyncBatcherOptions` to share common options between different `AsyncBatcher` instances:

```ts
import { asyncBatcherOptions, AsyncBatcher } from '@tanstack/pacer'

const sharedOptions = asyncBatcherOptions({
  maxSize: 5,
  wait: 2000,
  onSuccess: (results, batch, batcher) => console.log('Success')
})

const batcher1 = new AsyncBatcher(fn1, { ...sharedOptions, key: 'batcher1' })
const batcher2 = new AsyncBatcher(fn2, { ...sharedOptions, maxSize: 10 })
```
