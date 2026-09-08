# Async Retrying — Abort and Cancellation

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Abort and Cancellation

The async retryer supports manual cancellation of ongoing execution and pending retries:

### Manual Abort

```ts
const retryer = new AsyncRetryer(longRunningAsyncFn, {
  maxAttempts: 5,
  baseWait: 1000,
  onAbort: (reason, retryer) => {
    console.log('Execution aborted:', reason)
    // reason will be 'manual' when abort() is called
  }
})

// Start execution
const promise = retryer.execute()

// Cancel execution and pending retries
retryer.abort()

// The promise will resolve to undefined
// onAbort('manual') is called
const result = await promise
console.log(result) // undefined
```

### Making Functions Actually Cancellable with `getAbortSignal()`

For `abort()` to actually cancel your async function (like fetch requests), you need to use the abort signal in your function:

```ts
const retryer = new AsyncRetryer(
  async (url: string) => {
    const signal = retryer.getAbortSignal()
    if (signal) {
      // This fetch will be cancelled when abort() is called
      return await fetch(url, { signal })
    }
    // Fallback for when not executing
    return await fetch(url)
  },
  { maxAttempts: 3 }
)

// Start execution
const promise = retryer.execute('/api/data')

// This will now actually cancel the fetch request
retryer.abort()
```

**Important:** Without using `getAbortSignal()`, calling `abort()` will only cancel the retry logic but not the underlying async operation (like a fetch request). The signal ensures your function can be truly cancelled.

### Reset

The `reset()` method cancels execution and resets all state to initial values:

```ts
const retryer = new AsyncRetryer(asyncFn, { maxAttempts: 3 })

await retryer.execute()
console.log(retryer.store.state.executionCount) // 1

// Reset to initial state
retryer.reset()
console.log(retryer.store.state.executionCount) // 0
console.log(retryer.store.state.lastError) // undefined
console.log(retryer.store.state.lastResult) // undefined
```
