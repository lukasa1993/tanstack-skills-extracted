# Queuing

<a id="source-pacer-docs-framework-preact-guides-queuing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## How queuing works

This section is an exact duplicate. Read [How queuing works in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## When to use queuing

This section is an exact duplicate. Read [When to use queuing in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## Choose an API

- `useQueuedState` or `useQueuedValue` for a queue connected to Preact state
- `useQueuer` for direct queue lifecycle and ordering control

Use the queued state or value API when queue contents drive the UI. Use the instance API for ordering, capacity, expiration, pause, resume, flush, and manual processing.

## Preact example

```tsx
import { useQueuedState } from '@tanstack/preact-pacer'

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

Automatic processing uses `addItemsTo` to choose where new items enter and `getItemsFrom` to choose where items leave.

### FIFO

FIFO processes the oldest item first. This is the default.

```ts
const queuer = useQueuer(processItem, {
  addItemsTo: 'back',
  getItemsFrom: 'front',
  started: false,
})

queuer.addItem(1)
queuer.addItem(2)
queuer.addItem(3)
queuer.start() // Processes 1, 2, 3.
```

### LIFO

LIFO processes the newest item first.

```ts
const queuer = useQueuer(processItem, {
  addItemsTo: 'back',
  getItemsFrom: 'back',
  started: false,
})

queuer.addItem(1)
queuer.addItem(2)
queuer.addItem(3)
queuer.start() // Processes 3, 2, 1.
```

### Priority

Provide `getPriority` to process higher numeric priorities first. Priority ordering takes precedence over front and back retrieval.

```ts
type Task = { name: string; priority: number }

const queuer = useQueuer<Task>(processTask, {
  getPriority: (task) => task.priority,
  started: false,
})

queuer.addItem({ name: 'low', priority: 1 })
queuer.addItem({ name: 'high', priority: 3 })
queuer.addItem({ name: 'medium', priority: 2 })
queuer.start() // Processes high, medium, low.
```

## Automatic and manual processing

Queues start automatically by default. The first accepted item processes immediately, then `wait` controls the delay before later items.

```ts
const queuer = useQueuer(processItem, {
  wait: 1000,
})
```

Set `started: false` to collect items before processing:

```ts
const queuer = useQueuer(processItem, { started: false })

queuer.addItem(1)
queuer.addItem(2)
queuer.start()
queuer.stop()
```

`stop()` cancels the scheduled tick and retains queued items. `start()` resumes automatic processing.

For manual control:

- `execute()` removes and processes the next item immediately.
- `getNextItem()` removes and returns the next item without processing it.
- `peekNextItem()` returns the next item without removing it.
- `peekAllItems()` returns a copy of the current queue.

## Capacity and rejection

Set `maxSize` to bound the number of waiting items. An item added to a full queue is rejected, `addItem()` returns `false`, and `onReject` runs.

```ts
const queuer = useQueuer(processItem, {
  maxSize: 2,
  started: false,
  onReject: (item, queuer) => {
    console.log('Rejected:', item)
    console.log('Total rejections:', queuer.store.state.rejectionCount)
  },
})

queuer.addItem(1) // true
queuer.addItem(2) // true
queuer.addItem(3) // false
```

The active synchronous execution is not part of `size`; `size` counts items still waiting in the queue.

## Expiring stale items

Use `expirationDuration` to remove items that have waited too long:

```ts
const queuer = useQueuer(processItem, {
  expirationDuration: 5000,
  onExpire: (item) => {
    console.log('Expired:', item)
  },
})
```

Use `getIsExpired` for custom logic:

```ts
const queuer = useQueuer(processItem, {
  getIsExpired: (item, addedAt) => Date.now() - addedAt > item.maxAge,
})
```

Expiration is checked while the automatic processing loop runs. A stopped queue evaluates stale items when processing resumes.

## Flushing, clearing, and resetting

This section is an exact duplicate. Read [Flushing, clearing, and resetting in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## Configuring and observing the queue

Use `setOptions()` to update future behavior. Changing `started` through `setOptions()` does not call `start()` or `stop()`.

```ts
queuer.setOptions({ wait: 250, maxSize: 20 })
queuer.start()
```

The `wait` option may be a function that receives the queuer instance:

```ts
const queuer = useQueuer(processItem, {
  wait: (queuer) => (queuer.store.state.size > 20 ? 50 : 250),
})
```

Use callbacks for queue events:

- `onItemsChange`: An item was added or removed.
- `onExecute`: An item was processed.
- `onReject`: An item was rejected.
- `onExpire`: An item expired.

## Preact lifecycle

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

See the [Preact API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/preact/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
