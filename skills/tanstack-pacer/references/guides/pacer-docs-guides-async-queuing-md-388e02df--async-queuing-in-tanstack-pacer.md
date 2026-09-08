# Async Queuing — Async Queuing in TanStack Pacer

[Guide and prerequisites](./pacer-docs-guides-async-queuing-md-388e02df.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Async Queuing in TanStack Pacer

TanStack Pacer provides async queuing through the simple `asyncQueue` function and the more powerful `AsyncQueuer` class. All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported just like in the core queuing guide.

### Basic Usage with `asyncQueue`

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

### Advanced Usage with `AsyncQueuer` Class

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

### Async-Specific Features

All queue types and ordering strategies (FIFO, LIFO, priority, etc.) are supported—see the [Queuing Guide](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) for details. AsyncQueuer adds:
- **Concurrency:** Multiple items can be processed at once, controlled by the `concurrency` option (can be dynamic).
- **Async error handling:** Use `onError`, `onSuccess`, and `onSettled` for robust error and result tracking.
- **Active and pending task tracking:** Use `peekActiveItems()` and `peekPendingItems()` to monitor queue state.
- **Async expiration and rejection:** Items can expire or be rejected just like in the core queuing guide, but with async-specific callbacks.

### Example: Priority Async Queue

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

### Example: Error Handling

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

### Example: Dynamic Concurrency

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

### Queue Management and Monitoring

AsyncQueuer provides all the queue management and monitoring methods from the core queuing guide, plus async-specific ones:
- `peekActiveItems()` — Items currently being processed
- `peekPendingItems()` — Items waiting to be processed
- `queuer.store.state.successCount`, `queuer.store.state.errorCount`, `queuer.store.state.settledCount` — Execution statistics
- `queuer.store.state.activeItems` — Array of items currently being processed
- `queuer.store.state.size` — Current queue size
- `start()`, `stop()`, `clear()`, `reset()`, `flush()`, etc.

See the [Queuing Guide](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) for more on queue management concepts.

### Task Expiration and Rejection

AsyncQueuer supports expiration and rejection just like the core queuer:
- Use `expirationDuration`, `getIsExpired`, and `onExpire` for expiring tasks
- Use `maxSize` and `onReject` for handling queue overflow

See the [Queuing Guide](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) for details and examples.

### Flushing Queue Items

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

### Customizing Unmount Behavior

Framework hooks stop the queuer and abort any in-flight task executions by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead.

```tsx
const queuer = useAsyncQueuer(fn, {
  concurrency: 2,
  onUnmount: (q) => q.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your task function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.
