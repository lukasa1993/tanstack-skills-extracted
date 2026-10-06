# Async Batching

<a id="source-pacer-docs-framework-react-guides-async-batching-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## How async batching works

This section is an exact duplicate. Read [How async batching works in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Choose an API

This section is an exact duplicate. Read [Choose an API in Async Batching](./pacer-docs-framework-preact-guides-async-batching-md-cba9c2c9.md).

## React example

```tsx
import { useAsyncBatcher } from '@tanstack/react-pacer'

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

This section is an exact duplicate. Read [Batch boundaries and overlapping work in Async Batching](./pacer-docs-framework-preact-guides-async-batching-md-cba9c2c9.md).

## Errors and failed items

This section is an exact duplicate. Read [Errors and failed items in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Retrying batches

This section is an exact duplicate. Read [Retrying batches in Async Batching](./pacer-docs-framework-preact-guides-async-batching-md-cba9c2c9.md).

## Flushing, canceling, and clearing

This section is an exact duplicate. Read [Flushing, canceling, and clearing in Async Batching](./pacer-docs-framework-angular-guides-async-batching-md-92a24a19.md).

## Aborting active work

This section is an exact duplicate. Read [Aborting active work in Async Batching](./pacer-docs-framework-preact-guides-async-batching-md-cba9c2c9.md).

## React lifecycle

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

See the [React API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
