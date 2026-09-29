# Async Batching

<a id="source-pacer-docs-framework-preact-guides-async-batching-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## How async batching works

This section is an exact duplicate. Read [How async batching works in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Choose an API

- `useAsyncBatchedCallback` for adding items
- `useAsyncBatcher` for flush, failed items, and selected execution state

## Preact example

```tsx
import { useAsyncBatcher } from '@tanstack/preact-pacer'

function AnalyticsButton() {
  const batcher = useAsyncBatcher(
    sendEvents,
    { maxSize: 20, wait: 1000 },
    (state) => ({
      size: state.size,
      isExecuting: state.isExecuting,
    }),
  )

  return (
    <button onClick={() => void batcher.addItem({ type: 'click' })}>
      Track ({batcher.state.size} pending)
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncBatcher` and assume they run inside a component or another hook.

## Promise results

This section is an exact duplicate. Read [Promise results in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Batch boundaries and overlapping work

The batcher copies and clears the current items before calling the async function. Items added while that function is active collect in a new batch:

```text
execute [A, B] ───────────────── finish
       add C ─── add D ─── execute [C, D] ─── finish
```

If the second batch's trigger fires before the first finishes, both batch functions can overlap. `useAsyncBatcher` does not have a concurrency option. Serialize batch executions outside the batcher or send the completed batches through an async queue when overlap is unsafe.

## Errors and failed items

This section is an exact duplicate. Read [Errors and failed items in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Retrying batches

Configure retries for each batch execution with `asyncRetryerOptions`:

```ts
const batcher = useAsyncBatcher(sendEvents, {
  maxSize: 20,
  wait: 1000,
  asyncRetryerOptions: {
    maxAttempts: 3,
    backoff: 'exponential',
    baseWait: 500,
    jitter: 0.2,
  },
})
```

`maxAttempts` includes the first attempt, and every retry receives the same copied batch. See the [Async Retrying Guide](./pacer-docs-framework-preact-guides-async-retrying-md-cdac611d.md#source-pacer-docs-framework-preact-guides-async-retrying-md) before retrying operations with side effects.

## Flushing, canceling, and clearing

This section is an exact duplicate. Read [Flushing, canceling, and clearing in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Aborting active work

`abort()` aborts active retryers. It does not cancel a pending batch or remove collected items. Pass the batcher's signal to the underlying API for cancellation to propagate:

```ts
const batcher = useAsyncBatcher(
  async (events: Array<AnalyticsEvent>) => {
    return fetch('/api/analytics/batch', {
      method: 'POST',
      body: JSON.stringify(events),
      signal: batcher.getAbortSignal() ?? undefined,
    })
  },
  { maxSize: 20, wait: 1000 },
)

batcher.abort()
```

When executions overlap, pass an `executionCount` to `getAbortSignal()` when you need a specific execution's signal.

### Resetting safely

`reset()` restores default state, but it does not clear a scheduled timer or guarantee that active underlying work stops. Use the lifecycle methods first when a complete cleanup is required:

```ts
batcher.cancel()
batcher.abort()
batcher.reset()
```

## Preact lifecycle

The adapter cancels the pending wait timer and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Configuration and reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const batcher = useAsyncBatcher(
  sendEvents,
  { maxSize: 20, wait: 1000 },
  (state) => ({
    size: state.size,
    isExecuting: state.isExecuting,
    failedItems: state.failedItems,
  }),
)

console.log(
  batcher.state.size,
  batcher.state.isExecuting,
  batcher.state.failedItems,
)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

`wait` may be a number or a function that receives the batcher instance. `setOptions()` merges new options, and `asyncBatcherOptions()` creates reusable, type-checked option objects.

Do not use `started` to pause a batcher. It is currently a no-op, so every `addItem()` call evaluates the configured triggers.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers and active executions are not restored.

Common state includes:

- `items`, `size`, and `isPending`: The next batch and its timer state.
- `isExecuting`: Whether a batch is reported as executing.
- `lastResult`: The most recent successful result.
- `failedItems` and `totalItemsFailed`: Failure tracking.
- `successCount`, `errorCount`, and `settleCount`: Batch outcome counts.
- `totalItemsProcessed`: Items in successful batch executions.

See the [Preact API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/preact/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
