# Async Retrying — Dynamic Options and Enabling/Disabling

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Dynamic Options and Enabling/Disabling

The async retryer supports dynamic options that can change based on the retryer's current state:

### Dynamic Max Attempts

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: (retryer) => {
    // Retry more times for critical operations
    const errorCount = retryer.store.state.executionCount
    return errorCount > 5 ? 2 : 5
  }
})
```

### Dynamic Base Wait

```ts
const retryer = new AsyncRetryer(asyncFn, {
  baseWait: (retryer) => {
    // Increase wait time if we've had many errors
    const errorCount = retryer.store.state.executionCount
    return errorCount > 10 ? 2000 : 1000
  }
})
```

### Dynamic Max Wait

```ts
const retryer = new AsyncRetryer(asyncFn, {
  backoff: 'exponential',
  baseWait: 1000,
  maxWait: (retryer) => {
    // Increase max wait cap for critical operations
    const errorCount = retryer.store.state.executionCount
    return errorCount > 10 ? 10000 : 5000
  }
})
```

### Enabling/Disabling

```ts
const retryer = new AsyncRetryer(asyncFn, {
  enabled: (retryer) => {
    // Disable retrying after too many failures
    return retryer.store.state.executionCount < 100
  }
})
```
