# Async Rate Limiting — Key Differences from Synchronous Rate Limiting

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Key Differences from Synchronous Rate Limiting

### 1. Return Value Handling

Unlike the synchronous rate limiter which returns a boolean indicating success, the async version allows you to capture and use the return value from your rate-limited function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

### 2. Error Handling

The async rate limiter provides robust error handling capabilities:
- If your rate-limited function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `limiter.store.state.errorCount` and check execution state with `limiter.store.state.isExecuting`
- The rate limiter maintains its state and can continue to be used after an error occurs
- Rate limit rejections (when limit is exceeded) are handled separately from execution errors via the `onReject` handler

### 3. Different Callbacks

The `AsyncRateLimiter` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and rate limiter instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and rate limiter instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the rate limiter instance

Both the Async and Synchronous rate limiters support the `onReject` callback for handling blocked executions.

Example:

```ts
const asyncLimiter = new AsyncRateLimiter(async (id) => {
  await saveToAPI(id)
}, {
  limit: 5,
  window: 1000,
  onExecute: (rateLimiter) => {
    // Called after each successful execution
    console.log('Async function executed', rateLimiter.store.state.successCount)
  },
  onReject: (rateLimiter) => {
    // Called when an execution is rejected
    console.log(`Rate limit exceeded. Try again in ${rateLimiter.getMsUntilNextWindow()}ms`)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

### 4. Sequential Execution

Since the rate limiter's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.
