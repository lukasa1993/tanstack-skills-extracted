# Async Batching — State Management

[Guide and prerequisites](./pacer-docs-guides-async-batching-md-151108d1.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## State Management

The `AsyncBatcher` class uses TanStack Store for reactive state management, providing real-time access to batch execution state, error tracking, and processing statistics. All state is stored in a TanStack Store and can be accessed via `asyncBatcher.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncBatcher.state` along with providing a selector callback as the 3rd argument to the `useAsyncBatcher` hook to opt-in to state tracking as shown below.

### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncBatcher.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncBatcher = useAsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncBatcher.Subscribe selector={(state) => ({ isExecuting: state.isExecuting })}>
  {(state) => (
    <div>{state.isExecuting ? 'Executing...' : 'Idle'}</div>
  )}
</asyncBatcher.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncBatcher.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const batcher = useAsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })
console.log(batcher.state) // {}

// Opt-in to re-render when isExecuting changes
const batcher = useAsyncBatcher(
  asyncBatchFn,
  { maxSize: 5, wait: 1000 },
  (state) => ({ isExecuting: state.isExecuting })
)
console.log(batcher.state.isExecuting) // Reactive value

// Multiple state properties
const batcher = useAsyncBatcher(
  asyncBatchFn,
  { maxSize: 5, wait: 1000 },
  (state) => ({
    isExecuting: state.isExecuting,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

### Initial State

You can provide initial state values when creating an async batcher. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('async-batcher-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const batcher = new AsyncBatcher(asyncBatchFn, {
  maxSize: 5,
  wait: 1000,
  initialState
})
```

### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const batcher = new AsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })

// Subscribe to state changes
const unsubscribe = batcher.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

```ts
import { shallow, useSelector } from '@tanstack/react-store'

const batcher = useAsyncBatcher(asyncBatchFn, { maxSize: 5, wait: 1000 })

// you could manually use `useSelector` to subscribe to state changes in whatever scope you want
const state = useSelector(
  batcher.store,
  (state) => ({
    successCount: state.successCount,
  }),
  { compare: shallow },
)

console.log(state)
```

### Available State Properties

The `AsyncBatcherState` includes:

- `errorCount`: Number of batch executions that have resulted in errors
- `failedItems`: Array of items that failed during batch processing
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isExecuting`: Whether a batch is currently being processed asynchronously
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `lastResult`: The result from the most recent batch execution
- `settleCount`: Number of batch executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the batch queue
- `status`: Current processing status ('idle' | 'pending' | 'executing' | 'populated')
- `successCount`: Number of batch executions that have completed successfully
- `totalItemsFailed`: Total number of items that have failed processing across all batches
- `totalItemsProcessed`: Total number of items that have been processed across all batches

### Monitoring Failed Items

The async batcher tracks items that failed during batch processing:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might fail for some items
    if (items.some(item => item < 0)) {
      throw new Error('Negative numbers not allowed')
    }
    return await processBatch(items)
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      console.log('Failed batch:', batch)
      console.log('All failed items:', batcher.peekFailedItems())
    }
  }
)
```
