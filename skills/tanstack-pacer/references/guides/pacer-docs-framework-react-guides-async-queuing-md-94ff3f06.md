# Async Queuing

<a id="source-pacer-docs-framework-react-guides-async-queuing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## How async queuing works

This section is an exact duplicate. Read [How async queuing works in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Choose an API

This section is an exact duplicate. Read [Choose an API in Async Queuing](./pacer-docs-framework-preact-guides-async-queuing-md-fb762f4f.md).

## React example

```tsx
import { useAsyncQueuedState } from '@tanstack/react-pacer'

function UploadQueue() {
  const [pending, queue] = useAsyncQueuedState(
    uploadFile,
    { concurrency: 2 },
    (state) => ({
      items: state.items,
      activeItems: state.activeItems,
    }),
  )

  return (
    <button onClick={() => queue.addItem(nextFile())}>
      Upload ({pending.length} waiting, {queue.state.activeItems.length} active)
    </button>
  )
}
```

The focused snippets later in this guide use `useAsyncQueuer` and assume they run inside a component or another hook.

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing can begin immediately unless `started: false` is set.

## Ordering pending items

This section is an exact duplicate. Read [Ordering pending items in Async Queuing](./pacer-docs-framework-preact-guides-async-queuing-md-fb762f4f.md).

## Capacity and rejection

This section is an exact duplicate. Read [Capacity and rejection in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Results and errors

This section is an exact duplicate. Read [Results and errors in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Retrying items

This section is an exact duplicate. Read [Retrying items in Async Queuing](./pacer-docs-framework-preact-guides-async-queuing-md-fb762f4f.md).

## Starting, stopping, and flushing

This section is an exact duplicate. Read [Starting, stopping, and flushing in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Expiration

This section is an exact duplicate. Read [Expiration in Async Queuing](./pacer-docs-framework-angular-guides-async-queuing-md-b12d1785.md).

## Aborting active work

This section is an exact duplicate. Read [Aborting active work in Async Queuing](./pacer-docs-framework-preact-guides-async-queuing-md-fb762f4f.md).

## React lifecycle

The adapter stops automatic processing and aborts active work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Configuration and reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const queue = useAsyncQueuer(processJob, { concurrency: 2 }, (state) => ({
  size: state.size,
  activeItems: state.activeItems,
  status: state.status,
}))

console.log(queue.state.size, queue.state.activeItems, queue.state.status)
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

Use `peekPendingItems()`, `peekActiveItems()`, and `peekAllItems()` for copied item arrays. See the [React API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
