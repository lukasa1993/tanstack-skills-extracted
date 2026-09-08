# Async Retrying — Max Wait

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Max Wait

The `maxWait` option caps the maximum wait time between retries, preventing exponential or linear backoff from growing too large. This is particularly useful with exponential backoff, where wait times can quickly become very long:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  maxWait: 5000 // Cap wait time at 5 seconds
})
// Attempt 1: immediate
// Attempt 2: wait 1 second (1000ms * 2^0) - not capped
// Attempt 3: wait 2 seconds (1000ms * 2^1) - not capped
// Attempt 4: wait 4 seconds (1000ms * 2^2) - not capped
// Attempt 5: wait 5 seconds (would be 8s, but capped at 5s)
// Attempt 6: wait 5 seconds (would be 16s, but capped at 5s)
```

Without `maxWait`, exponential backoff can result in very long delays (e.g., 64 seconds, 128 seconds) that may be impractical for your use case. Setting `maxWait` ensures retries continue at a reasonable interval even after many attempts.

The `maxWait` option also supports dynamic functions:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  maxWait: (retryer) => {
    // Increase max wait for critical operations
    return retryer.store.state.executionCount > 10 ? 10000 : 5000
  }
})
```

By default, `maxWait` is `Infinity`, meaning there's no cap on wait times.
