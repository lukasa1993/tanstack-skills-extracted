# Async Retrying — Timeout Controls

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Timeout Controls

TanStack Pacer provides two types of timeout controls to prevent hanging operations:

### Individual Execution Timeout

The `maxExecutionTime` option sets the maximum time for a single function call:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxExecutionTime: 5000, // Abort individual calls after 5 seconds
  onExecutionTimeout: (retryer) => {
    console.log('Execution attempt timed out, retrying...')
  }
})
```

If a single execution exceeds this time, `onExecutionTimeout` is called, followed by `onAbort('execution-timeout')`, and the attempt will be aborted and retried (if attempts remain).

### Total Execution Timeout

The `maxTotalExecutionTime` option sets the maximum time for the entire retry operation:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 5,
  baseWait: 1000,
  maxTotalExecutionTime: 30000, // Abort entire operation after 30 seconds
  onTotalExecutionTimeout: (retryer) => {
    console.log('Total execution time exceeded, aborting...')
  }
})
```

If the total time across all attempts exceeds this limit, `onTotalExecutionTimeout` is called, followed by `onAbort('total-timeout')`, and the retry operation will be aborted.

### Combining Timeouts

You can combine both timeout types for comprehensive control:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 5,
  backoff: 'exponential',
  baseWait: 1000,
  maxWait: 5000, // Cap wait time between retries
  maxExecutionTime: 5000, // Individual call timeout
  maxTotalExecutionTime: 30000 // Overall operation timeout
})
```
