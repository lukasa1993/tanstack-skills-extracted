# Async Queuing — Advanced Features: Retry and Abort Support

[Guide and prerequisites](./pacer-docs-guides-async-queuing-md-388e02df.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Advanced Features: Retry and Abort Support

The async queuer includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight task executions.

### Retry Support

Configure automatic retries for failed task executions using the `asyncRetryerOptions`. Each queued item's execution will be retried according to these settings:

```ts
const queuer = new AsyncQueuer<string>(
  async (item) => {
    // This might fail due to network issues
    await api.processItem(item)
  },
  {
    concurrency: 2,
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

Cancel in-flight task executions using the abort functionality:

```ts
const queuer = new AsyncQueuer<string>(
  async (item) => {
    // Access the abort signal for this execution
    const signal = queuer.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/process/${item}`, { signal })
      return response.json()
    }
  },
  { concurrency: 2 }
)

// Add items to the queue
queuer.addItem('task1')
queuer.addItem('task2')
queuer.addItem('task3')

// Later, abort any in-flight task executions
queuer.abort()
```

The abort functionality:
- Cancels all ongoing task executions using AbortController
- Does NOT clear items from the queue (pending tasks remain queued)
- Works with concurrent executions - aborts all active tasks
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your task function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Sharing Options Between Instances

Use `asyncQueuerOptions` to share common options between different `AsyncQueuer` instances:

```ts
import { asyncQueuerOptions, AsyncQueuer } from '@tanstack/pacer'

const sharedOptions = asyncQueuerOptions({
  concurrency: 2,
  wait: 1000,
  onSuccess: (result, item, queuer) => console.log('Success')
})

const queuer1 = new AsyncQueuer(fn1, { ...sharedOptions, key: 'queuer1' })
const queuer2 = new AsyncQueuer(fn2, { ...sharedOptions, concurrency: 4 })
```
