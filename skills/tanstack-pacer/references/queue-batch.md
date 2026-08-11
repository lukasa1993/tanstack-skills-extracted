# Queue and batch

Synchronous and asynchronous queueing and batching.

<a id="source-pacer-docs-guides-async-batching-md"></a>

## Async Batching

Source: `pacer:docs/guides/async-batching.md`.

All core concepts from the [Batching Guide](./queue-batch.md#source-pacer-docs-guides-batching-md) apply to async batching as well.

### When to Use Async Batching

While the synchronous batcher works well for many use cases, async batching provides additional capabilities that are particularly useful when:

- You need to capture and use the return value from batch executions
- Your batch processing involves asynchronous operations (API calls, database operations, file I/O)
- You require advanced error handling with configurable error behavior
- You want to track success/error statistics separately
- You need to monitor when batches are actively executing

### Async Batching in TanStack Pacer

TanStack Pacer provides async batching through the `AsyncBatcher` class and the `asyncBatch` function. Unlike the synchronous version, the async batcher handles Promises and provides robust error handling capabilities.

#### Basic Usage with `asyncBatch`

The `asyncBatch` function provides a simple way to create an async batching function:

```ts
import { asyncBatch } from '@tanstack/pacer'

const processAsyncBatch = asyncBatch<number>(
  async (items) => {
    // Process the batch asynchronously
    const results = await Promise.all(
      items.map(item => processApiCall(item))
    )
    return results
  },
  {
    maxSize: 3,
    wait: 2000,
    onSuccess: (results, batch, batcher) => {
      console.log('Batch completed successfully:', results)
      console.log('Processed batch:', batch)
      console.log('Total successes:', batcher.store.state.successCount)
    },
    onError: (error, batch, batcher) => {
      console.error('Batch failed:', error)
      console.log('Failed batch:', batch)
      console.log('Total errors:', batcher.store.state.errorCount)
    }
  }
)

// Add items to be batched
processAsyncBatch(1)
processAsyncBatch(2)
processAsyncBatch(3) // Triggers batch processing
```

> **Note:** When using React, prefer `useAsyncBatchedCallback` hook over the `asyncBatch` function for better integration with React's lifecycle and automatic cleanup.

#### Advanced Usage with `AsyncBatcher` Class

For more control over async batch behavior, use the `AsyncBatcher` class directly:

```ts
import { AsyncBatcher } from '@tanstack/pacer'

const batcher = new AsyncBatcher<number>(
  async (items) => {
    // Process the batch asynchronously
    const results = await Promise.all(
      items.map(item => processApiCall(item))
    )
    return results
  },
  {
    maxSize: 5,
    wait: 3000,
    onSuccess: (results, batch, batcher) => {
      console.log('Batch succeeded:', results)
      console.log('Processed batch:', batch)
    },
    onError: (error, batch, batcher) => {
      console.error('Batch failed:', error)
      console.log('Failed batch:', batch)
    }
  }
)

// Access current state via TanStack Store
console.log(batcher.store.state.successCount) // Number of successful batch executions
console.log(batcher.store.state.errorCount) // Number of failed batch executions
console.log(batcher.store.state.isExecuting) // Whether a batch is currently executing
console.log(batcher.store.state.lastResult) // Result from most recent batch

// Add items to the batch
batcher.addItem(1)
batcher.addItem(2)

// Control batch execution
batcher.stop()  // Stop processing
batcher.start() // Resume processing
```

### Key Differences from Synchronous Batching

#### 1. Return Value Handling

Unlike the synchronous batcher which returns void, the async version allows you to capture and use the return value from your batch function:

```ts
const batcher = new AsyncBatcher<string>(
  async (items) => {
    const results = await processBatch(items)
    return results
  },
  {
    maxSize: 5,
    onSuccess: (results, batch, batcher) => {
      // Handle the returned results
      console.log('Batch results:', results)
      console.log('Processed batch:', batch)
    }
  }
)
```

#### 2. Error Handling

The async batcher provides comprehensive error handling capabilities:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might throw an error
    const results = await riskyBatchOperation(items)
    return results
  },
  {
    maxSize: 3,
    onError: (error, batch, batcher) => {
      // Handle batch errors
      console.error('Batch processing failed:', error)
      console.log('Items that failed:', batch)
      console.log('Total error count:', batcher.store.state.errorCount)
    },
    throwOnError: false, // Don't throw errors, just handle them
    onSuccess: (results, batch, batcher) => {
      console.log('Batch succeeded:', results)
      console.log('Processed batch:', batch)
      console.log('Total success count:', batcher.store.state.successCount)
    },
    onSettled: (batch, batcher) => {
      // Called after every batch (success or failure)
      console.log('Batch settled:', batch)
      console.log('Total batches:', batcher.store.state.settleCount)
    }
  }
)
```

#### 3. Execution State Tracking

The async batcher tracks when batches are actively executing:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    console.log('Starting batch execution...')
    const results = await longRunningBatchOperation(items)
    console.log('Batch execution completed')
    return results
  },
  {
    maxSize: 5,
    onItemsChange: (batcher) => {
      console.log('Is executing:', batcher.store.state.isExecuting)
      console.log('Items in queue:', batcher.store.state.size)
    }
  }
)
```

#### 4. Different Callbacks

The `AsyncBatcher` supports these async-specific callbacks:

- `onSuccess`: Called after each successful batch execution, providing the result, the batch of items processed, and batcher instance
- `onError`: Called when a batch execution fails, providing the error, the batch of items that failed, and batcher instance
- `onSettled`: Called after each batch execution (success or failure), providing the batch of items processed and batcher instance
- `onExecute`: Called after each batch execution, providing the batch of items processed and batcher instance (same as synchronous batcher)
- `onItemsChange`: Called when items are added or the batch is processed

### Advanced Features: Retry and Abort Support

The async batcher includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight operations.

#### Retry Support

Configure automatic retries for failed batch executions using the `asyncRetryerOptions`:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // This might fail due to network issues
    const results = await apiCall(items)
    return results
  },
  {
    maxSize: 5,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Abort Support

Cancel in-flight batch executions using the abort functionality:

```ts
const batcher = new AsyncBatcher<number>(
  async (items) => {
    // Access the abort signal for this execution
    const signal = batcher.getAbortSignal()
    if (signal) {
      const response = await fetch('/api/batch', {
        method: 'POST',
        body: JSON.stringify(items),
        signal // Pass signal to fetch for cancellation support
      })
      return response.json()
    }
  },
  { maxSize: 10 }
)

// Add items
batcher.addItem(1)
batcher.addItem(2)

// Later, abort any in-flight batch executions
batcher.abort()
```

The abort functionality:
- Cancels all ongoing batch executions using AbortController
- Does NOT cancel pending batches that haven't started yet (use `cancel()` for that)
- Does NOT clear items from the batcher
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your batch function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Sharing Options Between Instances

Use `asyncBatcherOptions` to share common options between different `AsyncBatcher` instances:

```ts
import { asyncBatcherOptions, AsyncBatcher } from '@tanstack/pacer'

const sharedOptions = asyncBatcherOptions({
  maxSize: 5,
  wait: 2000,
  onSuccess: (results, batch, batcher) => console.log('Success')
})

const batcher1 = new AsyncBatcher(fn1, { ...sharedOptions, key: 'batcher1' })
const batcher2 = new AsyncBatcher(fn2, { ...sharedOptions, maxSize: 10 })
```

### Error Handling Options

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

### Dynamic Options

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

#### Flushing Pending Batches

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

#### Customizing Unmount Behavior

Framework hooks cancel any pending batch and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const batcher = useAsyncBatcher(fn, {
  maxSize: 5,
  wait: 2000,
  onUnmount: (b) => b.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your batch function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.

### State Management

The `AsyncBatcher` class uses TanStack Store for reactive state management, providing real-time access to batch execution state, error tracking, and processing statistics. All state is stored in a TanStack Store and can be accessed via `asyncBatcher.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncBatcher.state` along with providing a selector callback as the 3rd argument to the `useAsyncBatcher` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

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

#### Initial State

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

#### Subscribing to State Changes

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

#### Available State Properties

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

#### Monitoring Failed Items

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

### Framework Adapters

Each framework adapter provides hooks that build on top of the core async batching functionality to integrate with the framework's state management system. Hooks like `useAsyncBatcher` or similar are available for each framework.

---

For core batching concepts and synchronous batching, see the [Batching Guide](./queue-batch.md#source-pacer-docs-guides-batching-md).

<a id="source-pacer-docs-guides-async-queuing-md"></a>

## Async Queuing

Source: `pacer:docs/guides/async-queuing.md`.

> **Note:** All core queuing concepts from the [Queuing Guide](./queue-batch.md#source-pacer-docs-guides-queuing-md) also apply to AsyncQueuer. AsyncQueuer extends these concepts with advanced features like concurrency (multiple tasks at once) and robust error handling. If you are new to queuing, start with the [Queuing Guide](./queue-batch.md#source-pacer-docs-guides-queuing-md) to learn about FIFO/LIFO, priority, expiration, rejection, and queue management. This guide focuses on what makes AsyncQueuer unique and powerful for asynchronous and concurrent task processing.

While the [Queuer](./queue-batch.md#source-pacer-docs-guides-queuing-md) provides synchronous queuing with timing controls, the `AsyncQueuer` is designed specifically for handling concurrent asynchronous operations. It implements what is traditionally known as a "task pool" or "worker pool" pattern, allowing multiple operations to be processed simultaneously while maintaining control over concurrency and timing. The implementation is mostly copied from [Swimmer](https://github.com/tannerlinsley/swimmer), Tanner's original task pooling utility that has been serving the JavaScript community since 2017.

### Async Queuing Concept

Async queuing extends the basic queuing concept by adding concurrent processing capabilities. Instead of processing one item at a time, an async queuer can process multiple items simultaneously while still maintaining order and control over the execution. This is particularly useful when dealing with I/O operations, network requests, or any tasks that spend most of their time waiting rather than consuming CPU.

#### Async Queuing Visualization

```text
Async Queuing (concurrency: 2, wait: 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️
Queue:       [ABC]   [C]    [CDE]    [E]    []
Active:      [A,B]   [B,C]  [C,D]    [D,E]  [E]
Completed:    -       A      B        C      D,E
             [=================================================================]
             ^ Unlike regular queuing, multiple items
               can be processed concurrently

             [Items queue up]   [Process 2 at once]   [Complete]
              when busy         with wait between      all items
```

#### When to Use Async Queuing

Async queuing is particularly effective when you need to:
- Process multiple asynchronous operations concurrently
- Control the number of simultaneous operations
- Handle Promise-based tasks with proper error handling
- Maintain order while maximizing throughput
- Process background tasks that can run in parallel

#### When Not to Use Async Queuing

The AsyncQueuer is very versatile and can be used in many situations. If you don't need concurrent processing, use [Queuing](./queue-batch.md#source-pacer-docs-guides-queuing-md) instead. If you don't need all executions that are queued to go through, use [Throttling](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) instead.

If you want to group operations together, use [Batching](./queue-batch.md#source-pacer-docs-guides-batching-md) instead.

### Async Queuing in TanStack Pacer

TanStack Pacer provides async queuing through the simple `asyncQueue` function and the more powerful `AsyncQueuer` class. All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported just like in the core queuing guide.

#### Basic Usage with `asyncQueue`

The `asyncQueue` function provides a simple way to create an always-running async queue:

```ts
import { asyncQueue } from '@tanstack/pacer'

// Create a queue that processes up to 2 items concurrently
const processItems = asyncQueue(
  async (item: number) => {
    // Process each item asynchronously
    const result = await fetchData(item)
    return result
  },
  {
    concurrency: 2,
    onItemsChange: (queuer) => {
      console.log('Active tasks:', queuer.peekActiveItems().length)
    }
  }
)

// Add items to be processed
processItems(1)
processItems(2)
```

For more control over the queue, use the `AsyncQueuer` class directly.

#### Advanced Usage with `AsyncQueuer` Class

The `AsyncQueuer` class provides complete control over async queue behavior, including all the core queuing features plus:
- **Concurrency:** Process multiple items at once (configurable with `concurrency`)
- **Async error handling:** Per-task and global error callbacks, with control over error propagation
- **Active and pending task tracking:** Monitor which tasks are running and which are queued
- **Async-specific callbacks:** `onSuccess`, `onError`, `onSettled`, etc.

```ts
import { AsyncQueuer } from '@tanstack/pacer'

const queue = new AsyncQueuer(
  async (item: number) => {
    // Process each item asynchronously
    const result = await fetchData(item)
    return result
  },
  {
    concurrency: 2, // Process 2 items at once
    wait: 1000,     // Wait 1 second between starting new items
    started: true,  // Start processing immediately
    key: 'data-processor' // Identify this queuer in devtools
  }
)

// Add error and success handlers via options
queue.setOptions({
  onError: (error, item, queuer) => {
    console.error('Task failed:', error)
    console.log('Failed item:', item)
    // You can access queue state here
    console.log('Error count:', queuer.store.state.errorCount)
  },
  onSuccess: (result, item, queuer) => {
    console.log('Task completed:', result)
    console.log('Completed item:', item)
    // You can access queue state here
    console.log('Success count:', queuer.store.state.successCount)
  },
  onSettled: (item, queuer) => {
    // Called after each execution (success or failure)
    console.log('Task settled:', item)
    console.log('Total settled:', queuer.store.state.settledCount)
  }
})

// Add items to be processed
queue.addItem(1)
queue.addItem(2)
```

#### Async-Specific Features

All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported—see the [Queuing Guide](./queue-batch.md#source-pacer-docs-guides-queuing-md) for details. AsyncQueuer adds:
- **Concurrency:** Multiple items can be processed at once, controlled by the `concurrency` option (can be dynamic).
- **Async error handling:** Use `onError`, `onSuccess`, and `onSettled` for robust error and result tracking.
- **Active and pending task tracking:** Use `peekActiveItems()` and `peekPendingItems()` to monitor queue state.
- **Async expiration and rejection:** Items can expire or be rejected just like in the core queuing guide, but with async-specific callbacks.

#### Example: Priority Async Queue

```ts
const priorityQueue = new AsyncQueuer(
  async (item: { value: string; priority: number }) => {
    // Process each item asynchronously
    return await processTask(item.value)
  },
  {
    concurrency: 2,
    getPriority: (item) => item.priority // Higher numbers have priority
  }
)

priorityQueue.addItem({ value: 'low', priority: 1 })
priorityQueue.addItem({ value: 'high', priority: 3 })
priorityQueue.addItem({ value: 'medium', priority: 2 })
// Processes: high and medium concurrently, then low
```

#### Example: Error Handling

```ts
const queue = new AsyncQueuer(
  async (item: number) => {
    // Process each item asynchronously
    if (item < 0) throw new Error('Negative item')
    return await processTask(item)
  },
  {
    onError: (error, item, queuer) => {
      console.error('Task failed:', error)
      console.log('Failed item:', item)
      // You can access queue state here
      console.log('Error count:', queuer.store.state.errorCount)
    },
    throwOnError: true, // Will throw errors even with onError handler
    onSuccess: (result, item, queuer) => {
      console.log('Task succeeded:', result)
      console.log('Succeeded item:', item)
      // You can access queue state here
      console.log('Success count:', queuer.store.state.successCount)
    },
    onSettled: (item, queuer) => {
      // Called after each execution (success or failure)
      console.log('Task settled:', item)
      console.log('Total settled:', queuer.store.state.settledCount)
    }
  }
)

queue.addItem(-1) // Will trigger error handling
queue.addItem(2)
```

#### Example: Dynamic Concurrency

```ts
const queue = new AsyncQueuer(
  async (item: number) => {
    // Process each item asynchronously
    return await processTask(item)
  },
  {
    // Dynamic concurrency based on system load
    concurrency: (queuer) => {
      return Math.max(1, 4 - queuer.store.state.activeItems.length)
    },
    // Dynamic wait time based on queue size
    wait: (queuer) => {
      return queuer.store.state.size > 10 ? 2000 : 1000
    }
  }
)
```

#### Queue Management and Monitoring

AsyncQueuer provides all the queue management and monitoring methods from the core queuing guide, plus async-specific ones:
- `peekActiveItems()` — Items currently being processed
- `peekPendingItems()` — Items waiting to be processed
- `queuer.store.state.successCount`, `queuer.store.state.errorCount`, `queuer.store.state.settledCount` — Execution statistics
- `queuer.store.state.activeItems` — Array of items currently being processed
- `queuer.store.state.size` — Current queue size
- `start()`, `stop()`, `clear()`, `reset()`, `flush()`, etc.

See the [Queuing Guide](./queue-batch.md#source-pacer-docs-guides-queuing-md) for more on queue management concepts.

#### Task Expiration and Rejection

AsyncQueuer supports expiration and rejection just like the core queuer:
- Use `expirationDuration`, `getIsExpired`, and `onExpire` for expiring tasks
- Use `maxSize` and `onReject` for handling queue overflow

See the [Queuing Guide](./queue-batch.md#source-pacer-docs-guides-queuing-md) for details and examples.

#### Flushing Queue Items

The async queuer supports flushing items to process them immediately:

```ts
const queue = new AsyncQueuer(processFn, { concurrency: 2, wait: 5000 })

queue.addItem('item1')
queue.addItem('item2')
queue.addItem('item3')
console.log(queue.store.state.size) // 3

// Flush all items immediately instead of waiting
queue.flush()
console.log(queue.store.state.activeItems.length) // 2 (processing concurrently)
console.log(queue.store.state.size) // 1 (one remaining)

// Or flush a specific number of items
queue.flush(1) // Process 1 more item
console.log(queue.store.state.activeItems.length) // 3 (all processing concurrently)
```

#### Customizing Unmount Behavior

Framework hooks stop the queuer and abort any in-flight task executions by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead.

```tsx
const queuer = useAsyncQueuer(fn, {
  concurrency: 2,
  onUnmount: (q) => q.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your task function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.

### Advanced Features: Retry and Abort Support

The async queuer includes built-in retry and abort capabilities through integration with `AsyncRetryer`. These features help handle transient failures and provide control over in-flight task executions.

#### Retry Support

Configure automatic retries for failed task executions using the `asyncRetryerOptions`. Each queued item's execution will be retried according to these settings:

```ts
const queuer = new AsyncQueuer<string>(
  async (item) => {
    // This might fail due to network issues
    await api.processItem(item)
  },
  {
    concurrency: 2,
    asyncRetryerOptions: {
      maxAttempts: 3,
      backoff: 'exponential',
      baseWait: 1000,
      maxWait: 10000,
      jitter: 0.3
    }
  }
)
```

For complete documentation on retry strategies, backoff algorithms, jitter, and advanced retry patterns, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Abort Support

Cancel in-flight task executions using the abort functionality:

```ts
const queuer = new AsyncQueuer<string>(
  async (item) => {
    // Access the abort signal for this execution
    const signal = queuer.getAbortSignal()
    if (signal) {
      const response = await fetch(`/api/process/${item}`, { signal })
      return response.json()
    }
  },
  { concurrency: 2 }
)

// Add items to the queue
queuer.addItem('task1')
queuer.addItem('task2')
queuer.addItem('task3')

// Later, abort any in-flight task executions
queuer.abort()
```

The abort functionality:
- Cancels all ongoing task executions using AbortController
- Does NOT clear items from the queue (pending tasks remain queued)
- Works with concurrent executions - aborts all active tasks
- Can be used alongside retry support

Abort only cancels underlying operations (e.g. `fetch`) when you pass the signal from `getAbortSignal()` to them. If your task function does not attach the signal, abort clears internal state but the async work continues until it completes.

For more details on abort patterns and integration with fetch/axios, see the [Async Retrying Guide](./async-retry.md#source-pacer-docs-guides-async-retrying-md).

#### Sharing Options Between Instances

Use `asyncQueuerOptions` to share common options between different `AsyncQueuer` instances:

```ts
import { asyncQueuerOptions, AsyncQueuer } from '@tanstack/pacer'

const sharedOptions = asyncQueuerOptions({
  concurrency: 2,
  wait: 1000,
  onSuccess: (result, item, queuer) => console.log('Success')
})

const queuer1 = new AsyncQueuer(fn1, { ...sharedOptions, key: 'queuer1' })
const queuer2 = new AsyncQueuer(fn2, { ...sharedOptions, concurrency: 4 })
```

### State Management

The `AsyncQueuer` class uses TanStack Store for reactive state management, providing real-time access to queue state, processing statistics, and concurrent task tracking. All state is stored in a TanStack Store and can be accessed via `asyncQueuer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `asyncQueuer.state` along with providing a selector callback as the 3rd argument to the `useAsyncQueuer` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `asyncQueuer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const asyncQueuer = useAsyncQueuer(processFn, { concurrency: 2, wait: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<asyncQueuer.Subscribe selector={(state) => ({ activeItems: state.activeItems })}>
  {(state) => (
    <div>Active items: {state.activeItems.length}</div>
  )}
</asyncQueuer.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `asyncQueuer.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const queue = useAsyncQueuer(processFn, { concurrency: 2, wait: 1000 })
console.log(queue.state) // {}

// Opt-in to re-render when activeItems changes
const queue = useAsyncQueuer(
  processFn,
  { concurrency: 2, wait: 1000 },
  (state) => ({ activeItems: state.activeItems })
)
console.log(queue.state.activeItems.length) // Reactive value

// Multiple state properties
const queue = useAsyncQueuer(
  processFn,
  { concurrency: 2, wait: 1000 },
  (state) => ({
    activeItems: state.activeItems,
    successCount: state.successCount,
    errorCount: state.errorCount
  })
)
```

#### Initial State

You can provide initial state values when creating an async queuer:

```ts
const savedState = localStorage.getItem('async-queuer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const queue = new AsyncQueuer(processFn, {
  concurrency: 2,
  wait: 1000,
  initialState
})
```

#### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const queue = new AsyncQueuer(processFn, { concurrency: 2, wait: 1000 })

// Subscribe to state changes
const unsubscribe = queue.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

#### Available State Properties

The `AsyncQueuerState` includes all properties from the core queuing guide plus:

- `activeItems`: Array of items currently being processed
- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `errorCount`: Number of function executions that have resulted in errors
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `lastResult`: The result from the most recent successful function execution
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `settledCount`: Number of function executions that have completed (either successfully or with errors)
- `size`: Number of items currently in the queue
- `status`: Current processing status ('idle' | 'running' | 'stopped')
- `successCount`: Number of function executions that have completed successfully

#### Framework Adapters

Each framework adapter builds convenient hooks and functions around the async queuer classes. Hooks like `useAsyncQueuer` or `useAsyncQueuedState` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For core queuing concepts and synchronous queuing, see the [Queuing Guide](./queue-batch.md#source-pacer-docs-guides-queuing-md).

<a id="source-pacer-docs-guides-batching-md"></a>

## Batching

Source: `pacer:docs/guides/batching.md`.

Batching is a powerful technique for grouping multiple operations together and processing them as a single unit. Unlike [Queuing](./queue-batch.md#source-pacer-docs-guides-queuing-md), which ensures every operation is processed individually, batching collects items and processes them in configurable groups, improving efficiency and reducing overhead. This guide covers the Batching concepts of TanStack Pacer.

### Batching Concept

Batching collects items over time or until a certain size is reached, then processes them all at once. This is ideal for scenarios where processing items in bulk is more efficient than handling them one by one. Batching can be triggered by:
- Reaching a maximum batch size
- Waiting a maximum amount of time
- Custom logic (e.g., a special item or condition)

#### Batching Visualization

```text
Batching (processing every 3 items or every 2 seconds)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Batch:       [ABC]   []      [DE]      []      [FGH]  []
Executed:     ✅             ✅         ✅
             [===============================]
             ^ Items are grouped and processed together

             [Items accumulate]   [Process batch]   [Empty]
                in batch           as group         batch
```

### When to Use Batching

Batching is best when:
- Processing items in groups is more efficient (e.g., network requests, database writes)
- You want to reduce the frequency of expensive operations
- You need to control the rate or size of processing
- You want to debounce bursts of activity into fewer operations

### When Not to Use Batching

Batching may not be ideal when:
- Every item must be processed individually and immediately (use [queuing](./queue-batch.md#source-pacer-docs-guides-queuing-md))
- You only care about the most recent value (use [debouncing](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md))

> [!TIP]
> If you find yourself making repeated calls that could be grouped, batching can help you optimize performance and resource usage.

### Batching in TanStack Pacer

TanStack Pacer provides batching through the `Batcher` class and the simple `batch` function. Both allow you to collect items and process them in configurable batches.

#### Basic Usage with `batch`

The `batch` function provides a simple way to create a batching function:

```ts
import { batch } from '@tanstack/pacer'

// Create a batcher that processes up to 3 items or every 2 seconds
const processBatch = batch<number>(
  (items) => {
    // Process the batch
    console.log('Processing batch:', items)
  },
  {
    maxSize: 3, // Process when 3 items are collected
    wait: 2000, // Or after 2 seconds, whichever comes first
    onItemsChange: (batcher) => {
      console.log('Current batch:', batcher.peekAllItems())
    }
  }
)

// Add items to be batched
processBatch(1)
processBatch(2)
processBatch(3) // Triggers batch processing
processBatch(4)
// Or wait 2 seconds for the next batch to process
```

> **Note:** When using React, prefer `useBatchedCallback` hook over the `batch` function for better integration with React's lifecycle and automatic cleanup.

The `batch` function returns a function that adds items to the batch. Batches are processed automatically based on your configuration.

#### Advanced Usage with `Batcher` Class

The `Batcher` class provides full control over batching behavior:

```ts
import { Batcher } from '@tanstack/pacer'

// Create a batcher that processes up to 5 items or every 3 seconds
const batcher = new Batcher<number>(
  (items) => {
    // Process the batch
    console.log('Processing batch:', items)
  },
  {
    maxSize: 5, // Process when 5 items are collected
    wait: 3000, // Or after 3 seconds
    getShouldExecute: (items, batcher) => items.includes(42), // Custom trigger
    onItemsChange: (batcher) => {
      console.log('Current batch:', batcher.peekAllItems())
    }
  }
)

// Add items to the batch
batcher.addItem(1)
batcher.addItem(2)
batcher.addItem(3)
// ...

// Manually process the current batch
batcher.execute()

// Control batching
batcher.stop()  // Pause batching
batcher.start() // Resume batching
```

### Batcher Options

Batcher options allow you to customize how and when batches are processed:

- `maxSize`: Maximum number of items per batch (default: `Infinity`)
- `wait`: Maximum time (ms) to wait before processing a batch (default: `Infinity`)
- `getShouldExecute`: Custom function to determine if a batch should be processed
- `onExecute`: Callback after a batch is processed
- `onItemsChange`: Callback after items are added or batch is processed
- `onIsRunningChange`: Callback when the batcher's running state changes
- `started`: Whether the batcher starts running immediately (default: `true`)

### Batcher Methods

The `Batcher` class provides several methods for batch management:

```ts
batcher.addItem(item)           // Add an item to the batch
batcher.execute()               // Manually process the current batch
batcher.stop()                  // Pause batching
batcher.start()                 // Resume batching
batcher.store.state.size        // Get current batch size
batcher.store.state.isEmpty     // Check if batch is empty
batcher.store.state.isRunning   // Check if batcher is running
batcher.peekAllItems()           // Get all items in the current batch
batcher.store.state.executionCount // Number of batches processed
batcher.store.state.totalItemsProcessed // Number of items processed
batcher.setOptions(opts)        // Update batcher options
batcher.flush()                 // Flush pending batch immediately
```

### Custom Batch Triggers

You can use `getShouldExecute` to trigger a batch based on custom logic:

```ts
const batcher = new Batcher<number>(
  (items) => console.log('Processing batch:', items),
  {
    getShouldExecute: (items) => items.includes(99),
  }
)

batcher.addItem(1)
batcher.addItem(99) // Triggers batch processing immediately
```

### Dynamic Configuration

You can update batcher options at runtime:

```ts
batcher.setOptions({
  maxSize: 10,
  wait: 1000,
})

const options = batcher.getOptions()
console.log(options.maxSize) // 10
```

### State Management

The `Batcher` class uses TanStack Store for reactive state management, providing real-time access to batch state, execution counts, and processing status. All state is stored in a TanStack Store and can be accessed via `batcher.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `batcher.state` along with providing a selector callback as the 3rd argument to the `useBatcher` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `batcher.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const batcher = useBatcher(processFn, { maxSize: 5, wait: 1000 })

// Subscribe to state changes deep in component tree using Subscribe component
<batcher.Subscribe selector={(state) => ({ size: state.size })}>
  {(state) => (
    <div>Batch size: {state.size}</div>
  )}
</batcher.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `batcher.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const batcher = useBatcher(processFn, { maxSize: 5, wait: 1000 })
console.log(batcher.state) // {}

// Opt-in to re-render when size changes
const batcher = useBatcher(
  processFn,
  { maxSize: 5, wait: 1000 },
  (state) => ({ size: state.size })
)
console.log(batcher.state.size) // Reactive value

// Multiple state properties
const batcher = useBatcher(
  processFn,
  { maxSize: 5, wait: 1000 },
  (state) => ({
    size: state.size,
    executionCount: state.executionCount,
    status: state.status
  })
)
```

#### Initial State

You can provide initial state values when creating a batcher. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('batcher-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const batcher = new Batcher(processFn, {
  maxSize: 5,
  wait: 1000,
  initialState
})
```

#### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const batcher = new Batcher(processFn, { maxSize: 5, wait: 1000 })

// Subscribe to state changes
const unsubscribe = batcher.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

#### Available State Properties

The `BatcherState` includes:

- `executionCount`: Number of batch executions that have been completed
- `isEmpty`: Whether the batcher has no items to process (items array is empty)
- `isPending`: Whether the batcher is waiting for the timeout to trigger batch processing
- `items`: Array of items currently queued for batch processing
- `size`: Number of items currently in the batch queue
- `status`: Current processing status ('idle' | 'pending')
- `totalItemsProcessed`: Total number of items that have been processed across all batches

#### Flushing Pending Batches

The batcher supports flushing pending batches to trigger processing immediately:

```ts
const batcher = new Batcher(processFn, { maxSize: 10, wait: 5000 })

batcher.addItem('item1')
batcher.addItem('item2')
console.log(batcher.store.state.isPending) // true

// Flush immediately instead of waiting
batcher.flush()
console.log(batcher.store.state.isEmpty) // true (batch was processed)
```

#### Customizing Unmount Behavior

Framework hooks cancel pending batches by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const batcher = useBatcher(fn, {
  maxSize: 5,
  wait: 2000,
  onUnmount: (b) => b.flush(),
})
```

### Framework Adapters

Each framework adapter builds convenient hooks and functions around the batcher classes. Hooks like `useBatcher`, or `createBatcher` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

For asynchronous batching, see the [Async Batching Guide](./queue-batch.md#source-pacer-docs-guides-async-batching-md).

<a id="source-pacer-docs-guides-queuing-md"></a>

## Queuing

Source: `pacer:docs/guides/queuing.md`.

Unlike [Rate Limiting](./rate-limiting.md#source-pacer-docs-guides-rate-limiting-md), [Throttling](./debounce-throttle.md#source-pacer-docs-guides-throttling-md), and [Debouncing](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) which drop executions when they occur too frequently, queuers can be configured to ensure that every operation is processed. They provide a way to manage and control the flow of operations without losing any requests. This makes them ideal for scenarios where data loss is unacceptable. Queuing can also be set to have a maximum size, which can be useful for preventing memory leaks or other issues. This guide will cover the Queuing concepts of TanStack Pacer.

### Queuing Concept

Queuing ensures that every operation is eventually processed, even if they come in faster than they can be handled. Unlike the other execution control techniques that drop excess operations, queuing buffers operations in an ordered list and processes them according to specific rules. This makes queuing the only "lossless" execution control technique in TanStack Pacer, unless a `maxSize` is specified which can cause items to be rejected when the buffer is full.

#### Queuing Visualization

```text
Queuing (processing one item every 2 ticks)
Timeline: [1 second per tick]
Calls:        ⬇️  ⬇️  ⬇️     ⬇️  ⬇️     ⬇️  ⬇️  ⬇️
Queue:       [ABC]   [BC]    [BCDE]    [DE]    [E]    []
Executed:     ✅     ✅       ✅        ✅      ✅     ✅
             [=================================================================]
             ^ Unlike rate limiting/throttling/debouncing,
               ALL calls are eventually processed in order

             [Items queue up]   [Process steadily]   [Empty]
              when busy          one by one           queue
```

#### When to Use Queuing

Queuing is particularly important when you need to ensure that every operation is processed, even if it means introducing some delay. This makes it ideal for scenarios where data consistency and completeness are more important than immediate execution. When using a `maxSize`, it can also serve as a buffer to prevent overwhelming a system with too many pending operations.

#### When Not to Use Queuing

Queuing might not be the best choice when:
- Immediate feedback is more important than processing every operation
- You only care about the most recent value (use [debouncing](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) instead)
- You want to group operations together (use [batching](./queue-batch.md#source-pacer-docs-guides-batching-md) instead)

> [!TIP]
> If you're currently using rate limiting, throttling, or debouncing but finding that dropped operations are causing problems, queuing is likely the solution you need.

### Queuing in TanStack Pacer

TanStack Pacer provides queuing through the simple `queue` function and the more powerful `Queuer` class. While other execution control techniques typically favor their function-based APIs, queuing often benefits from the additional control provided by the class-based API.

#### Basic Usage with `queue`

The `queue` function provides a simple way to create an always-running queue that processes items as they're added:

```ts
import { queue } from '@tanstack/pacer'

// Create a queue that processes items every second
const processItems = queue<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    wait: 1000,
    maxSize: 10, // Optional: limit queue size to prevent memory or time issues
    onItemsChange: (queuer) => {
      console.log('Current queue:', queuer.peekAllItems())
    }
  }
)

// Add items to be processed
processItems(1) // Processed immediately
processItems(2) // Processed after 1 second
processItems(3) // Processed after 2 seconds
```


While the `queue` function is simple to use, it only provides a basic always-running queue through the `addItem` method. For most use cases, you'll want the additional control and features provided by the `Queuer` class.

#### Advanced Usage with `Queuer` Class

The `Queuer` class provides complete control over queue behavior and processing:

```ts
import { Queuer } from '@tanstack/pacer'

// Create a queue that processes items every second
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    wait: 1000, // Wait 1 second between processing items
    maxSize: 5, // Optional: limit queue size to prevent memory or time issues
    onItemsChange: (queuer) => {
      console.log('Current queue:', queuer.peekAllItems())
    }
  }
)

// Start processing
queue.start()

// Add items to be processed
queue.addItem(1)
queue.addItem(2)
queue.addItem(3)

// Items will be processed one at a time with 1 second delay between each
// Output:
// Processing: 1 (immediately)
// Processing: 2 (after 1 second)
// Processing: 3 (after 2 seconds)
```

#### Queue Types and Ordering

What makes TanStack Pacer's Queuer unique is its ability to adapt to different use cases through its position-based API. The same Queuer can behave as a traditional queue, a stack, or a double-ended queue, all through the same consistent interface.

##### FIFO Queue (First In, First Out)

The default behavior where items are processed in the order they were added. This is the most common queue type and follows the principle that the first item added should be the first one processed. When using `maxSize`, new items will be rejected if the queue is full.

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    addItemsTo: 'back', // default
    getItemsFrom: 'front', // default
  }
)
queue.addItem(1) // [1]
queue.addItem(2) // [1, 2]
// Processes: 1, then 2
```

##### LIFO Stack (Last In, First Out)

By specifying 'back' as the position for both adding and retrieving items, the queuer behaves like a stack. In a stack, the most recently added item is the first one to be processed. When using `maxSize`, new items will be rejected if the stack is full.

```ts
const stack = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    addItemsTo: 'back', // default
    getItemsFrom: 'back', // override default for stack behavior
  }
)
stack.addItem(1) // [1]
stack.addItem(2) // [1, 2]
// Items will process in order: 2, then 1

stack.getNextItem('back') // get next item from back of queue instead of front
```

##### Priority Queue

Priority queues add another dimension to queue ordering by allowing items to be sorted based on their priority rather than just their insertion order. Each item is assigned a priority value, and the queue automatically maintains the items in priority order. When using `maxSize`, lower priority items may be rejected if the queue is full.

```ts
const priorityQueue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    getPriority: (n) => n // Higher numbers have priority
  }
)
priorityQueue.addItem(1) // [1]
priorityQueue.addItem(3) // [3, 1]
priorityQueue.addItem(2) // [3, 2, 1]
// Processes: 3, 2, then 1
```

#### Starting and Stopping

The `Queuer` class supports starting and stopping processing through the `start()` and `stop()` methods. By default, queues start processing automatically. You can set `started: false` to have the queue paused initially, allowing you to either:

1. Start processing later with `start()`
2. Manually process items by calling `getNextItem()` in an event-driven manner

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    started: false // Start paused
  }
)

queue.start() // Begin processing items
queue.stop()  // Pause processing

// Manually process items while the queue is stopped (run it your own way)
queue.getNextItem() // Get next item
queue.getNextItem() // Get next item
queue.getNextItem() // Get next item
```

#### Sharing Options Between Instances

Use `queuerOptions` to share common options between different `Queuer` instances:

```ts
import { queuerOptions, Queuer } from '@tanstack/pacer'

const sharedOptions = queuerOptions({
  wait: 1000,
  maxSize: 10,
  onItemsChange: (queuer) => console.log('Items changed')
})

const queuer1 = new Queuer(fn1, { ...sharedOptions, key: 'queuer1' })
const queuer2 = new Queuer(fn2, { ...sharedOptions, wait: 2000 })
```

#### Additional Features

The Queuer provides several helpful methods for queue management:

```ts
// Queue inspection
queue.peekNextItem()           // View next item without removing it
queue.store.state.size         // Get current queue size
queue.store.state.isEmpty      // Check if queue is empty
queue.store.state.isFull       // Check if queue has reached maxSize
queue.peekAllItems()           // Get copy of all queued items

// Queue manipulation
queue.clear()                  // Remove all items
queue.reset()                  // Reset to initial state
queue.store.state.executionCount // Get number of processed items
queue.flush()                  // Flush all pending items immediately

// Event handling (use the onItemsChange option, not a method)
// Example:
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    onItemsChange: (queuer) => {
      console.log('Processed:', queuer.peekAllItems())
    }
  }
)
```

#### Item Expiration

The Queuer supports automatic expiration of items that have been in the queue too long. This is useful for preventing stale data from being processed or for implementing timeouts on queued operations.

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    expirationDuration: 5000, // Items expire after 5 seconds
    onExpire: (item, queuer) => {
      console.log('Item expired:', item)
    }
  }
)

// Or use a custom expiration check
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    getIsExpired: (item, addedAt) => {
      // Custom expiration logic
      return Date.now() - addedAt > 5000
    },
    onExpire: (item, queuer) => {
      console.log('Item expired:', item)
    }
  }
)

// Check expiration statistics
console.log(queue.store.state.expirationCount) // Number of items that have expired
```

Expiration features are particularly useful for:
- Preventing stale data from being processed
- Implementing timeouts on queued operations
- Managing memory usage by automatically removing old items
- Handling temporary data that should only be valid for a limited time

#### Rejection Handling

When a queue reaches its maximum size (set by `maxSize` option), new items will be rejected. The Queuer provides ways to handle and monitor these rejections:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    maxSize: 2, // Only allow 2 items in queue
    onReject: (item, queuer) => {
      console.log('Queue is full. Item rejected:', item)
    }
  }
)

queue.addItem(1) // Accepted
queue.addItem(2) // Accepted
queue.addItem(3) // Rejected, triggers onReject callback

console.log(queue.store.state.rejectionCount) // 1
```

#### Initial Items

You can pre-populate a queue with initial items when creating it:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    initialItems: [1, 2, 3],
    started: true // Start processing immediately
  }
)

// Queue starts with [1, 2, 3] and begins processing
```

#### Dynamic Configuration

The Queuer's options can be modified after creation using `setOptions()`. Additionally, several options support dynamic values through callback functions:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    wait: 1000,
    started: false
  }
)

// Change configuration
queue.setOptions({
  wait: 500, // Process items twice as fast
  started: true // Start processing
})

// Access current state
console.log(queue.store.state.size) // Current queue size
console.log(queue.store.state.isRunning) // Whether queue is running
```

#### Dynamic Options

Several options in the Queuer support dynamic values through callback functions that receive the queuer instance:

```ts
const queue = new Queuer<number>(
  (item) => {
    // Process each item
    console.log('Processing:', item)
  },
  {
    // Dynamic wait time based on queue size
    wait: (queuer) => {
      return queuer.store.state.size > 10 ? 2000 : 1000
    }
  }
)
```

The following options support dynamic values:
- `wait`: Can be a number or a function that returns a number

This allows for sophisticated queue behavior that adapts to runtime conditions.

#### Flushing Queue Items

The queuer supports flushing items to process them immediately:

```ts
const queue = new Queuer(processFn, { wait: 5000 })

queue.addItem('item1')
queue.addItem('item2')
console.log(queue.store.state.size) // 2

// Flush all items immediately instead of waiting
queue.flush()
console.log(queue.store.state.size) // 0 (items were processed)

// Or flush a specific number of items
queue.addItem('item3')
queue.addItem('item4')
queue.addItem('item5')
queue.flush(2) // Process only 2 items
console.log(queue.store.state.size) // 1 (one item remaining)
```

#### Customizing Unmount Behavior

Framework hooks stop the queuer by default when a component unmounts. Use the `onUnmount` option to flush instead.

```tsx
const queuer = useQueuer(fn, {
  wait: 1000,
  onUnmount: (q) => q.flush(),
})
```

### State Management

The `Queuer` class uses TanStack Store for reactive state management, providing real-time access to queue state, processing statistics, and concurrent task tracking. All state is stored in a TanStack Store and can be accessed via `queuer.store.state`, although, if you are using a framework adapter like React or Solid, you will not want to read the state from here. Instead, you will read the state from `queuer.state` along with providing a selector callback as the 3rd argument to the `useQueuer` hook to opt-in to state tracking as shown below.

#### State Selector (Framework Adapters)

Framework adapters support subscribing to state changes in two ways:

**1. Using `queuer.Subscribe` component (Recommended for component tree subscriptions)**

Use the `Subscribe` component to subscribe to state changes deep in your component tree without needing to pass a selector to the hook. This is ideal when you want to subscribe to state in child components.

```tsx
// Default behavior - no reactive state subscriptions at hook level
const queuer = useQueuer(processFn, { wait: 1000, maxSize: 10 })

// Subscribe to state changes deep in component tree using Subscribe component
<queuer.Subscribe selector={(state) => ({ size: state.size })}>
  {(state) => (
    <div>Queue size: {state.size}</div>
  )}
</queuer.Subscribe>
```

**2. Using the `selector` parameter (For hook-level subscriptions)**

The `selector` parameter allows you to specify which state changes will trigger reactive updates at the hook level, optimizing performance by preventing unnecessary updates when irrelevant state changes occur.

**By default, `queuer.state` is empty (`{}`) as the selector is empty by default.** This is where the selected slice of TanStack Store state is exposed. You must opt-in to state tracking by providing a selector function.

```ts
// Default behavior - no reactive state subscriptions
const queue = useQueuer(processFn, { wait: 1000, maxSize: 10 })
console.log(queue.state) // {}

// Opt-in to re-render when size changes
const queue = useQueuer(
  processFn,
  { wait: 1000, maxSize: 10 },
  (state) => ({ size: state.size })
)
console.log(queue.state.size) // Reactive value

// Multiple state properties
const queue = useQueuer(
  processFn,
  { wait: 1000, maxSize: 10 },
  (state) => ({
    size: state.size,
    executionCount: state.executionCount,
    status: state.status
  })
)
```

#### Initial State

You can provide initial state values when creating a queuer. This is commonly used to restore state from persistent storage:

```ts
// Load initial state from localStorage
const savedState = localStorage.getItem('queuer-state')
const initialState = savedState ? JSON.parse(savedState) : {}

const queue = new Queuer(processFn, {
  wait: 1000,
  maxSize: 10,
  initialState
})
```

#### Subscribing to State Changes

The store is reactive and supports subscriptions:

```ts
const queue = new Queuer(processFn, { wait: 1000, maxSize: 10 })

// Subscribe to state changes
const unsubscribe = queue.store.subscribe((state) => {
  // do something with the state like persist it to localStorage
})

// Unsubscribe when done
unsubscribe()
```

> **Note:** Framework adapters already subscribe through `useSelector` (React/Preact/Solid) or `injectSelector` (Angular) from TanStack Store. To subscribe manually, use `useSelector(store, selector, { compare: shallow })` from `@tanstack/react-store` (or `@tanstack/preact-store` / `@tanstack/solid-store`; import `shallow` from the same package), or `injectSelector(store, selector)` from `@tanstack/angular-store`.

#### Available State Properties

The `QueuerState` includes:

- `addItemCount`: Number of times addItem has been called (for reduction calculations)
- `executionCount`: Number of items that have been processed by the queuer
- `expirationCount`: Number of items that have been removed from the queue due to expiration
- `isEmpty`: Whether the queuer has no items to process (items array is empty)
- `isFull`: Whether the queuer has reached its maximum capacity
- `isIdle`: Whether the queuer is not currently processing any items
- `isRunning`: Whether the queuer is active and will process items automatically
- `items`: Array of items currently waiting to be processed
- `itemTimestamps`: Timestamps when items were added to the queue for expiration tracking
- `pendingTick`: Whether the queuer has a pending timeout for processing the next item
- `rejectionCount`: Number of items that have been rejected from being added to the queue
- `size`: Number of items currently in the queue
- `status`: Current processing status ('idle' | 'running' | 'stopped')

#### Framework Adapters

Each framework adapter builds convenient hooks and functions around the queuer classes. Hooks like `useQueuer`, `useQueuedState`, and `useQueuedValue` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous queuing, see the [Async Queuing Guide](./queue-batch.md#source-pacer-docs-guides-async-queuing-md).
