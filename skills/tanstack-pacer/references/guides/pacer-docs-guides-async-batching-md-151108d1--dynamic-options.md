# Async Batching — Dynamic Options

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Dynamic Options

Like the synchronous batcher, the async batcher supports dynamic options:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    return await processBatch(items)
  },
  {
    // Dynamic batch size based on success rate
    maxSize: (batcher) => {
      const successRate = batcher.store.state.successCount / Math.max(1, batcher.store.state.settleCount)
      return successRate > 0.8 ? 10 : 5 // Larger batches if success rate is high
    },
    // Dynamic wait time based on error count
    wait: (batcher) => {
      return batcher.store.state.errorCount > 5 ? 5000 : 2000 // Wait longer if errors are frequent
    }
  }
)
```

### Flushing Pending Batches

The async batcher supports flushing pending batches to trigger processing immediately:

```ts
const batcher = new AsyncBatcher(asyncBatchFn, { maxSize: 10, wait: 5000 })

batcher.addItem('item1')
batcher.addItem('item2')
console.log(batcher.store.state.isPending) // true

// Flush immediately instead of waiting
const result = await batcher.flush()
console.log('Flush result:', result)
console.log(batcher.store.state.isEmpty) // true (batch was processed)
```

### Customizing Unmount Behavior

Framework hooks cancel any pending batch and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const batcher = useAsyncBatcher(fn, {
  maxSize: 5,
  wait: 2000,
  onUnmount: (b) => b.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your batch function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.
