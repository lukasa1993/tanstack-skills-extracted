# Async Rate Limiting — Advanced Features: Retry and Abort Support

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Advanced Features: Retry and Abort Support

The async rate limiter includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

### Retry Support

Configure automatic retries for failed rate-limited function executions using the `asyncRetryerOptions`:

```ts
const rateLimitedApi = asyncRateLimit(
  async (userId: string) => {
    // This might fail due to network issues
    const data = await api.fetchUser(userId)
    return data
  },
  {
    limit: 5,
    window: 1000,
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

Cancel in-flight rate-limited executions using the abort functionality:

```ts
const rateLimiter = new AsyncRateLimiter(
  async (userId: string) => {
    // Access the abort signal for this execution
    const signal = rateLimiter.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/users/${userId}`, { signal })
      return response.json()
    }
  },
  { limit: 5, window: 1000 }
)

// Start some operations
rateLimiter.maybeExecute('user1')
rateLimiter.maybeExecute('user2')

// Later, abort any in-flight executions
rateLimiter.abort()
```

The abort functionality:
- Cancels all ongoing rate-limited executions using AbortController
- Does NOT clear execution times or reset the rate limiter
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your rate-limited function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md).

### Sharing Options Between Instances

Use `asyncRateLimiterOptions` to share common options between different `AsyncRateLimiter` instances:

```ts
import { asyncRateLimiterOptions, AsyncRateLimiter } from '@tanstack/pacer'

const sharedOptions = asyncRateLimiterOptions({
  limit: 5,
  window: 1000,
  onSuccess: (result, args, limiter) => console.log('Success')
})

const limiter1 = new AsyncRateLimiter(fn1, { ...sharedOptions, key: 'limiter1' })
const limiter2 = new AsyncRateLimiter(fn2, { ...sharedOptions, onError: (error) => console.error('Error') })
```
