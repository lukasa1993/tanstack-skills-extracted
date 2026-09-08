# Async Throttling — Advanced Features: Retry and Abort Support

[Guide and prerequisites](./pacer-docs-guides-async-throttling-md-de3ed145.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Advanced Features: Retry and Abort Support

The async throttler includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

### Retry Support

Configure automatic retries for failed throttled function executions using the `asyncRetryerOptions`:

```ts
const throttledSave = asyncThrottle(
  async (data: string) => {
    // This might fail due to network issues
    await api.save(data)
  },
  {
    wait: 1000,
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

Cancel in-flight throttled executions using the abort functionality:

```ts
const throttler = new AsyncThrottler(
  async (data: string) => {
    // Access the abort signal for this execution
    const signal = throttler.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/save', {
        method: 'POST',
        body: data,
        signal
      })
      return response.json()
    }
  },
  { wait: 1000 }
)

// Start an operation
throttler.maybeExecute('data')

// Later, abort any in-flight execution
throttler.abort()
```

The abort functionality:
- Cancels all ongoing throttled executions using AbortController
- Does NOT cancel pending executions that haven't started yet (use `cancel()` for that)
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your throttled function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Sharing Options Between Instances

Use `asyncThrottlerOptions` to share common options between different `AsyncThrottler` instances:

```ts
import { asyncThrottlerOptions, AsyncThrottler } from '@tanstack/pacer'

const sharedOptions = asyncThrottlerOptions({
  wait: 500,
  leading: true,
  trailing: true,
  onSuccess: (result, args, throttler) => console.log('Success')
})

const throttler1 = new AsyncThrottler(fn1, { ...sharedOptions, key: 'throttler1' })
const throttler2 = new AsyncThrottler(fn2, { ...sharedOptions, wait: 1000 })
```
