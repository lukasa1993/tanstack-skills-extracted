# Async Batching — Error Handling Options

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Error Handling Options

The async batcher provides flexible error handling through the `throwOnError` option:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might throw an error
    throw new Error('Batch processing failed')
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      console.error('Handling error:', error)
    },
    throwOnError: true, // Will throw errors even with onError handler
    // throwOnError: false, // Will swallow errors (default if onError is provided)
    // throwOnError: undefined, // Uses default behavior based on onError presence
  }
)
```

- **Default behavior**: `throwOnError` is `true` if no `onError` handler is provided, `false` if an `onError` handler is provided
- **With `onError` handler**: The handler is called first, then the error is thrown if `throwOnError` is `true`
- **Error state**: Failed items are tracked in `failedItems` array and can be accessed via `peekFailedItems()`. The `onError` callback receives the batch of items that failed, not the accumulated failed items.
