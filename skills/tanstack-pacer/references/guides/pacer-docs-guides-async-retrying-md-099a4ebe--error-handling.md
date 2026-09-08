# Async Retrying — Error Handling

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Error Handling

The async retryer provides comprehensive error handling through callbacks and the `throwOnError` option:

### Error Throwing Behavior

The `throwOnError` option controls when errors are thrown:

```ts
// Default: throw only the last error after all retries fail
const retryer1 = new AsyncRetryer(asyncFn, {
  throwOnError: 'last' // Default
})

// Throw every error immediately (disables retrying)
const retryer2 = new AsyncRetryer(asyncFn, {
  throwOnError: true
})

// Never throw errors, return undefined instead
const retryer3 = new AsyncRetryer(asyncFn, {
  throwOnError: false
})
```

### Error Callbacks

The async retryer supports multiple callbacks for different stages of execution:

```ts
const retryer = new AsyncRetryer(asyncFn, {
  maxAttempts: 3,
  onRetry: (attempt, error, retryer) => {
    // Called before each retry attempt
    console.log(`Retrying (attempt ${attempt})...`)
    console.log('Error:', error.message)
    console.log('Current attempt:', retryer.store.state.currentAttempt)
  },
  onError: (error, args, retryer) => {
    // Called for every error (including during retries)
    console.error('Execution failed:', error)
    console.log('Failed with arguments:', args)
  },
  onLastError: (error, retryer) => {
    // Called only for the final error after all retries fail
    console.error('All retries exhausted:', error)
    console.log('Total execution time:', retryer.store.state.totalExecutionTime)
  },
  onSuccess: (result, args, retryer) => {
    // Called when execution succeeds
    console.log('Execution succeeded:', result)
    console.log('Succeeded with arguments:', args)
    console.log('Attempts used:', retryer.store.state.currentAttempt)
  },
  onSettled: (args, retryer) => {
    // Called after each attempt completes (success or failure), including after all retries are exhausted
    console.log('Execution settled')
    console.log('Total executions:', retryer.store.state.executionCount)
  },
  onAbort: (reason, retryer) => {
    // Called when execution is aborted (manually or due to timeouts)
    // reason can be: 'manual', 'execution-timeout', 'total-timeout', or 'new-execution'
    console.log('Execution aborted:', reason)
    if (reason === 'execution-timeout') {
      console.log('Single execution timed out')
    } else if (reason === 'total-timeout') {
      console.log('Total execution time exceeded')
    }
  },
  onExecutionTimeout: (retryer) => {
    // Called when a single execution attempt times out (maxExecutionTime exceeded)
    console.log('Execution attempt timed out')
    console.log('Current attempt:', retryer.store.state.currentAttempt)
  },
  onTotalExecutionTimeout: (retryer) => {
    // Called when the total execution time times out (maxTotalExecutionTime exceeded)
    console.log('Total execution time exceeded')
    console.log('Total time:', retryer.store.state.totalExecutionTime)
  }
})
```

### Callback Execution Order

The callbacks are executed in the following order:

```text
1. execute() called
2. Try attempt 1
   └─ If execution times out (maxExecutionTime):
      ├─ onExecutionTimeout() called
      ├─ onAbort('execution-timeout') called
      └─ onSettled() called (in finally block)
   └─ If fails:
      ├─ onError(error) called
      ├─ onRetry(1, error) called
      ├─ onSettled() called (in finally block)
      └─ Wait for backoff
   └─ If succeeds:
      ├─ onSuccess(result) called
      ├─ onSettled() called (in finally block)
      └─ Return result
3. Try attempt 2
   └─ If total time exceeds (maxTotalExecutionTime):
      ├─ onTotalExecutionTimeout() called
      ├─ onAbort('total-timeout') called
      └─ Execution aborted
   └─ If execution times out:
      ├─ onExecutionTimeout() called
      ├─ onAbort('execution-timeout') called
      └─ onSettled() called (in finally block)
   └─ If fails:
      ├─ onError(error) called
      ├─ onRetry(2, error) called
      ├─ onSettled() called (in finally block)
      └─ Wait for backoff
4. Try attempt 3 (last attempt)
   └─ If fails:
      ├─ onError(error) called
      ├─ onSettled() called (in finally block)
      ├─ onLastError(error) called (after loop exits)
      ├─ onSettled() called (after all retries exhausted)
      └─ Throw error (if throwOnError is 'last' or true)
   └─ If succeeds:
      ├─ onSuccess(result) called
      ├─ onSettled() called (in finally block)
      └─ Return result
5. Manual abort or new execution:
   └─ onAbort('manual') or onAbort('new-execution') called
```
