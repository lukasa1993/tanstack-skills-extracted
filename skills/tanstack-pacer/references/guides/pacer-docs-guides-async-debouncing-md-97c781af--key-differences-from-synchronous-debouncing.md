# Async Debouncing — Key Differences from Synchronous Debouncing

[Guide and prerequisites](./pacer-docs-guides-async-debouncing-md-97c781af.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Key Differences from Synchronous Debouncing

### 1. Return Value Handling

Unlike the synchronous debouncer which returns void, the async version allows you to capture and use the return value from your debounced function. The `maybeExecute` method returns a Promise that resolves with the function's return value, allowing you to await the result and handle it appropriately.

### 2. Error Handling

The async debouncer provides robust error handling capabilities:
- If your debounced function throws an error and no `onError` handler is provided, the error will be thrown and propagate up to the caller
- If you provide an `onError` handler, errors will be caught and passed to the handler instead of being thrown
- The `throwOnError` option can be used to control error throwing behavior:
  - When true (default if no onError handler), errors will be thrown
  - When false (default if onError handler provided), errors will be swallowed
  - Can be explicitly set to override these defaults
- You can track error counts using `debouncer.store.state.errorCount` and check execution state with `debouncer.store.state.isExecuting`
- The debouncer maintains its state and can continue to be used after an error occurs

### 3. Different Callbacks

The `AsyncDebouncer` supports the following callbacks:
- `onSuccess`: Called after each successful execution, providing the result, the arguments that were executed, and debouncer instance
- `onSettled`: Called after each execution (success or failure), providing the arguments that were executed and debouncer instance
- `onError`: Called if the async function throws an error, providing the error, the arguments that caused the error, and the debouncer instance

Example:

```ts
const asyncDebouncer = new AsyncDebouncer(async (value) => {
  await saveToAPI(value)
}, {
  wait: 500,
  onSuccess: (result, args, debouncer) => {
    // Called after each successful execution
    console.log('Async function executed', debouncer.store.state.successCount)
    console.log('Executed arguments:', args)
  },
  onSettled: (args, debouncer) => {
    // Called after each execution attempt
    console.log('Async function settled', debouncer.store.state.settleCount)
    console.log('Settled arguments:', args)
  },
  onError: (error) => {
    // Called if the async function throws an error
    console.error('Async function failed:', error)
  }
})
```

### 4. Sequential Execution

Since the debouncer's `maybeExecute` method returns a Promise, you can choose to await each execution before starting the next one. This gives you control over the execution order and ensures each call processes the most up-to-date data. This is particularly useful when dealing with operations that depend on the results of previous calls or when maintaining data consistency is critical.

For example, if you're updating a user's profile and then immediately fetching their updated data, you can await the update operation before starting the fetch.
