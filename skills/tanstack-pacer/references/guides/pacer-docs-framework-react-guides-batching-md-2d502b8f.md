# Batching

<a id="source-pacer-docs-framework-react-guides-batching-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## How batching works

This section is an exact duplicate. Read [How batching works in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## When to use batching

This section is an exact duplicate. Read [When to use batching in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## Choose an API

This section is an exact duplicate. Read [Choose an API in Batching](./pacer-docs-framework-preact-guides-batching-md-e86fc694.md).

## React example

```tsx
import { useBatcher } from '@tanstack/react-pacer'

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

This section is an exact duplicate. Read [Choosing batch triggers in Batching](./pacer-docs-framework-preact-guides-batching-md-e86fc694.md).

## Controlling collected items

This section is an exact duplicate. Read [Controlling collected items in Batching](./pacer-docs-framework-angular-guides-batching-md-7fcb9449.md).

## Configuring and observing batches

This section is an exact duplicate. Read [Configuring and observing batches in Batching](./pacer-docs-framework-preact-guides-batching-md-e86fc694.md).

## React lifecycle

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

See the [React API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
