# Batching

<a id="source-pacer-docs-framework-preact-guides-batching-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## How batching works

This section is an exact duplicate. Read [How batching works in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## When to use batching

This section is an exact duplicate. Read [When to use batching in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## Choose an API

- `useBatchedCallback` for a stable item-adder
- `useBatcher` for flush, cancel, collected items, and selected state

Use the callback API when adding items is all the component needs. Use the instance API for `flush()`, `cancel()`, collected items, selected state, and dynamic options.

## Preact example

```tsx
import { useBatcher } from '@tanstack/preact-pacer'

function AnalyticsButton() {
  const batcher = useBatcher(
    sendEvents,
    { maxSize: 20, wait: 1000 },
    (state) => ({
      size: state.size,
    }),
  )

  return (
    <button onClick={() => batcher.addItem({ type: 'click' })}>
      Track ({batcher.state.size} pending)
    </button>
  )
}
```

The focused snippets later in this guide use `useBatcher` and assume they run inside a component or another hook.

## Choosing batch triggers

### Batch size

`maxSize` executes the batch as soon as the number of collected items reaches the limit.

```ts
const batcher = useBatcher(processBatch, {
  maxSize: 100,
})
```

The default is `Infinity`, so a size trigger is disabled unless you provide one.

### Wait time

`wait` executes a batch after no new items arrive for the configured duration. Every added item restarts the timer.

```ts
const batcher = useBatcher(processBatch, {
  wait: 1000,
})
```

The default is `Infinity`, so a time trigger is disabled unless you provide one. A continuous stream of items can keep restarting the timer. Combine `wait` with `maxSize` when a batch must eventually run under continuous traffic.

### Custom trigger

`getShouldExecute` runs after each item is added. Return `true` to execute the current batch immediately.

```ts
const batcher = useBatcher<number>(processBatch, {
  getShouldExecute: (items) => items.includes(0),
})

batcher.addItem(4)
batcher.addItem(0) // Executes [4, 0].
```

If several triggers are configured, the first one reached executes the batch.

## Controlling collected items

This section is an exact duplicate. Read [Controlling collected items in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## Configuring and observing batches

Use `setOptions()` to update future trigger behavior:

```ts
batcher.setOptions({
  maxSize: 20,
  wait: 500,
})
```

Changing `wait` does not reschedule an existing timer. The next `addItem()` call replaces that timer using the current value.

The `wait` option may be a function that receives the batcher instance:

```ts
const batcher = useBatcher(processBatch, {
  wait: (batcher) => (batcher.store.state.size > 10 ? 100 : 500),
})
```

Use `onItemsChange` to observe collection changes and `onExecute` to observe completed batch calls:

```ts
const batcher = useBatcher(processBatch, {
  maxSize: 10,
  onItemsChange: (batcher) => {
    console.log('Collected:', batcher.store.state.size)
  },
  onExecute: (items, batcher) => {
    console.log('Processed:', items)
    console.log('Batches:', batcher.store.state.executionCount)
  },
})
```

Do not use `started` to pause a batcher. It is currently a no-op, so every `addItem()` call evaluates the configured triggers.

## Preact lifecycle

The adapter cancels the pending wait timer while retaining collected items when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const batcher = useBatcher(
  processBatch,
  { maxSize: 20, wait: 1000 },
  (state) => ({
    size: state.size,
    isPending: state.isPending,
  }),
)

console.log(batcher.state.size, batcher.state.isPending)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items`: Items currently collected.
- `size`: Number of collected items.
- `isEmpty`: Whether the batch is empty.
- `isPending`: Whether a wait timer is active.
- `executionCount`: Completed batch executions.
- `totalItemsProcessed`: Items passed to completed batch executions.
- `status`: `'idle'` or `'pending'`.

See the [Preact API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/preact/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
