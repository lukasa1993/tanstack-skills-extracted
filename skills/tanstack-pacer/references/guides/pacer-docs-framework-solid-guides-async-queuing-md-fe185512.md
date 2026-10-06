# Async Queuing

<a id="source-pacer-docs-framework-solid-guides-async-queuing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## How async queuing works

This section is an exact duplicate. Read [How async queuing works in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Choose an API

- `createAsyncQueuer` for concurrency, ordering, lifecycle methods, and selected state

## Solid example

```tsx
import { createAsyncQueuer } from '@tanstack/solid-pacer'

const queue = createAsyncQueuer(uploadFile, { concurrency: 2 }, (state) => ({
  items: state.items,
  activeItems: state.activeItems,
}))

queue.addItem(nextFile())
console.log(queue.state().items.length, queue.state().activeItems.length)
```

The focused snippets later in this guide use `createAsyncQueuer` and assume they run inside a Solid reactive owner.

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing can begin immediately unless `started: false` is set.

## Ordering pending items

The synchronous ordering rules still apply:

- The default adds at the back and reads from the front, producing FIFO order.
- Set `getItemsFrom: 'back'` for LIFO order.
- Set `addItemsTo` or pass a position to `addItem()` to control insertion.
- Set `getPriority(item)` to order higher numeric priorities first.

Priority ordering takes precedence over front or back removal.

```ts
const queue = createAsyncQueuer(processJob, {
  started: false,
  concurrency: 2,
  getPriority: (job) => job.priority,
})

queue.addItem({ id: 'low', priority: 1 })
queue.addItem({ id: 'high', priority: 10 })
queue.addItem({ id: 'medium', priority: 5 })
queue.start()
```

The high and medium jobs start first. Their relative completion order is not guaranteed.

## Capacity and rejection

This section is an exact duplicate. Read [Capacity and rejection in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Results and errors

This section is an exact duplicate. Read [Results and errors in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Retrying items

Each started item receives its own retryer:

```ts
const queue = createAsyncQueuer(processJob, {
  concurrency: 2,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

A retry remains part of the same active item and continues to occupy a concurrency slot. `maxAttempts` includes the first attempt. See the [Async Retrying Guide](./pacer-docs-framework-solid-guides-async-retrying-md-13290069.md#source-pacer-docs-framework-solid-guides-async-retrying-md) before retrying jobs with side effects.

## Starting, stopping, and flushing

This section is an exact duplicate. Read [Starting, stopping, and flushing in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Expiration

This section is an exact duplicate. Read [Expiration in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Aborting active work

`abort()` aborts the retryers for all active executions. It does not clear pending items. Cancellation reaches the underlying API only when the processing function uses its signal:

```ts
const queue = createAsyncQueuer(
  async (job: Job) => {
    return fetch(`/api/jobs/${job.id}`, {
      method: 'POST',
      signal: queue.getAbortSignal() ?? undefined,
    })
  },
  { concurrency: 2 },
)

queue.abort()
```

When multiple executions overlap, pass an `executionCount` to `getAbortSignal()` when you need a specific execution's signal.

### Resetting safely

`reset()` restores default state, including an empty pending queue and a running status. It does not clear the queue's wait timers or guarantee that active underlying work stops. Use explicit lifecycle methods first:

```ts
queue.stop()
queue.abort()
queue.reset()
```

## Solid lifecycle

The adapter stops automatic processing and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Configuration and reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility inside a Solid reactive owner and select only fields used by the view:

```ts
const queue = createAsyncQueuer(processJob, { concurrency: 2 }, (state) => ({
  size: state.size,
  activeItems: state.activeItems,
  status: state.status,
}))

console.log(queue.state().size, queue.state().activeItems, queue.state().status)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

`concurrency` and `wait` may be values or functions that receive the queue instance. `setOptions()` merges new options, and `asyncQueuerOptions()` creates reusable, type-checked option objects.

`initialState` can restore selected queue state that your app has persisted. If it includes `items`, they take precedence over `initialItems`; `initialState.isRunning` likewise takes precedence over `started`. Restore only durable fields. Pending timers and active executions are not restored.

Common state includes:

- `items` and `size`: Pending work.
- `activeItems`: Work currently tracked as active.
- `isRunning`, `isIdle`, and `status`: Scheduler state.
- `isFull` and `rejectionCount`: Pending capacity state.
- `successCount`, `errorCount`, and `settleCount`: Execution outcomes.
- `lastResult`: The most recent successful processing result.

Use `peekPendingItems()`, `peekActiveItems()`, and `peekAllItems()` for copied item arrays. See the [Solid API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/solid/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
