# Async Queuing

<a id="source-pacer-docs-framework-vanilla-guides-async-queuing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## How async queuing works

This section is an exact duplicate. Read [How async queuing works in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Quick start

Use `asyncQueue` when enqueueing is the only operation you need:

```ts
import { asyncQueue } from '@tanstack/pacer'

const enqueue = asyncQueue(
  async (job: Job) => {
    await processJob(job)
  },
  { concurrency: 2 },
)

const accepted = enqueue(job)
```

The returned function is the bound `addItem()` method. It returns `true` when the item enters the pending queue and `false` when the queue rejects it. It does not return a Promise for that item's result.

Use `AsyncQueuer` for lifecycle methods, callbacks, and state:

```ts
import { AsyncQueuer } from '@tanstack/pacer'

const queue = new AsyncQueuer(processJob, {
  concurrency: 2,
  maxSize: 100,
  onSuccess: (result, item) => {
    console.log('Completed:', item.id, result)
  },
  onError: (error, item) => {
    console.error('Failed:', item.id, error)
  },
  onReject: (item) => {
    console.warn('Queue full:', item.id)
  },
})

queue.addItem(job)
```

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing can begin immediately unless `started: false` is set.

## Ordering pending items

The synchronous ordering rules still apply:

- The default adds at the back and reads from the front, producing FIFO order.
- Set `getItemsFrom: 'back'` for LIFO order.
- Set `addItemsTo` or pass a position to `addItem()` to control insertion.
- Set `getPriority(item)` to order higher numeric priorities first.

Priority ordering takes precedence over front or back removal.

```ts
const queue = new AsyncQueuer(processJob, {
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

Automatically scheduled work runs in the background. Observe results through `onSuccess` or `queue.store.state.lastResult`. Observe failures through `onError` and the error counters.

For direct control, `execute()` removes and processes one pending item. Its Promise resolves with the item that was processed, not the wrapped function's result. The result is passed to `onSuccess` and stored as `lastResult`.

Without `onError`, `throwOnError` defaults to `true`. Background scheduling catches that rejection after updating callbacks and state so the queue can continue. A direct call to `execute()` or `flush()` can reject to its caller. Providing `onError` changes the default to `false`.

Callbacks include:

- `onSuccess(result, item, queue)` after a successful item.
- `onError(error, item, queue)` after its retries fail.
- `onSettled(item, queue)` after either outcome.
- `onItemsChange(queue)` when the pending collection changes.
- `onReject(item, queue)` and `onExpire(item, queue)` for items that never execute.

An item is removed from the pending queue before its function starts. A failed item is not automatically added back.

## Retrying items

Each started item receives its own retryer:

```ts
const queue = new AsyncQueuer(processJob, {
  concurrency: 2,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

A retry remains part of the same active item and continues to occupy a concurrency slot. `maxAttempts` includes the first attempt. See the [Async Retrying Guide](./pacer-docs-framework-vanilla-guides-async-retrying-md-315874fb.md#source-pacer-docs-framework-vanilla-guides-async-retrying-md) before retrying jobs with side effects.

## Starting, stopping, and flushing

This section is an exact duplicate. Read [Starting, stopping, and flushing in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Expiration

This section is an exact duplicate. Read [Expiration in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Aborting active work

`abort()` aborts the retryers for all active executions. It does not clear pending items. Cancellation reaches the underlying API only when the processing function uses its signal:

```ts
const queue = new AsyncQueuer(
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

## Configuration and state

`concurrency` and `wait` may be values or functions that receive the queue instance. `setOptions()` merges new options, and `asyncQueuerOptions()` creates reusable, type-checked option objects.

`initialState` can restore selected queue state that your app has persisted. If it includes `items`, they take precedence over `initialItems`; `initialState.isRunning` likewise takes precedence over `started`. Restore only durable fields. Pending timers and active executions are not restored.

Common state includes:

- `items` and `size`: Pending work.
- `activeItems`: Work currently tracked as active.
- `isRunning`, `isIdle`, and `status`: Scheduler state.
- `isFull` and `rejectionCount`: Pending capacity state.
- `successCount`, `errorCount`, and `settleCount`: Execution outcomes.
- `lastResult`: The most recent successful processing result.

Use `peekPendingItems()`, `peekActiveItems()`, and `peekAllItems()` for copied item arrays. See the [`AsyncQueuer` API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/reference/classes/AsyncQueuer.md) for all methods and state.
