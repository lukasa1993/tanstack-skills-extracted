# Queuing

<a id="source-pacer-docs-framework-react-guides-queuing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## How queuing works

This section is an exact duplicate. Read [How queuing works in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## When to use queuing

This section is an exact duplicate. Read [When to use queuing in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## Choose an API

- `useQueuedState` or `useQueuedValue` for a queue connected to React state
- `useQueuer` for direct queue lifecycle and ordering control

Use the queued state or value API when queue contents drive the UI. Use the instance API for ordering, capacity, expiration, pause, resume, flush, and manual processing.

## React example

```tsx
import { useQueuedState } from '@tanstack/react-pacer'

function JobQueue() {
  const [items, addItem, queue] = useQueuedState(
    processJob,
    { wait: 500 },
    (state) => ({
      items: state.items,
      isRunning: state.isRunning,
    }),
  )

  return (
    <>
      <button onClick={() => addItem(nextJob())}>Add job</button>
      <button
        onClick={() => (queue.state.isRunning ? queue.stop() : queue.start())}
      >
        {queue.state.isRunning ? 'Pause' : 'Resume'} ({items.length})
      </button>
    </>
  )
}
```

The focused snippets later in this guide use `useQueuer` and assume they run inside a component or another hook.

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing can begin immediately unless `started: false` is set.

## Ordering items

This section is an exact duplicate. Read [Ordering items in Queuing](./pacer-docs-framework-preact-guides-queuing-md-d8ef2df5.md).

## Automatic and manual processing

This section is an exact duplicate. Read [Automatic and manual processing in Queuing](./pacer-docs-framework-preact-guides-queuing-md-d8ef2df5.md).

## Capacity and rejection

This section is an exact duplicate. Read [Capacity and rejection in Queuing](./pacer-docs-framework-preact-guides-queuing-md-d8ef2df5.md).

## Expiring stale items

This section is an exact duplicate. Read [Expiring stale items in Queuing](./pacer-docs-framework-preact-guides-queuing-md-d8ef2df5.md).

## Flushing, clearing, and resetting

This section is an exact duplicate. Read [Flushing, clearing, and resetting in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## Configuring and observing the queue

This section is an exact duplicate. Read [Configuring and observing the queue in Queuing](./pacer-docs-framework-preact-guides-queuing-md-d8ef2df5.md).

## React lifecycle

The adapter stops automatic processing when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const queuer = useQueuer(processItem, { wait: 250 }, (state) => ({
  size: state.size,
  isRunning: state.isRunning,
}))

console.log(queuer.state.size, queuer.state.isRunning)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

`initialState` can restore selected queue state that your app has persisted. If it includes `items`, they take precedence over `initialItems`; `initialState.isRunning` likewise takes precedence over `started`. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items` and `size`: Items still waiting.
- `isRunning`: Whether automatic processing is enabled.
- `isIdle`: Whether a running queue is empty.
- `isFull`: Whether `maxSize` has been reached.
- `executionCount`: Items whose wrapped function returned successfully.
- `rejectionCount` and `expirationCount`: Items removed without processing.
- `status`: `'idle'`, `'running'`, or `'stopped'`.

See the [React API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
