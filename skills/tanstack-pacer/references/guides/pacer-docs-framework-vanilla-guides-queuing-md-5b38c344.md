# Queuing

<a id="source-pacer-docs-framework-vanilla-guides-queuing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../queue-batch.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## How queuing works

This section is an exact duplicate. Read [How queuing works in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## When to use queuing

This section is an exact duplicate. Read [When to use queuing in Queuing](./pacer-docs-framework-angular-guides-queuing-md-cfd6ce2e.md).

## Using queuing in TanStack Pacer

TanStack Pacer provides two core APIs:

- `queue` returns a function that adds an item to an automatically running queue.
- `Queuer` exposes ordering, lifecycle, capacity, expiration, callbacks, and state.

### Convenience function

```ts
import { queue } from '@tanstack/pacer'

const processItem = queue<number>(
  (item) => {
    console.log('Processing:', item)
  },
  { wait: 1000 },
)

processItem(1) // true, accepted and processed immediately.
processItem(2) // true, accepted and queued.
processItem(3) // true, accepted and queued.
```

The returned function reports whether the item was accepted. It does not expose queue lifecycle methods.

### Class API

```ts
import { Queuer } from '@tanstack/pacer'

const queuer = new Queuer<number>(
  (item) => {
    console.log('Processing:', item)
  },
  {
    wait: 1000,
    maxSize: 10,
  },
)

queuer.addItem(1)
queuer.addItem(2)

console.log(queuer.peekAllItems())
```

Pass `initialItems` when work is already available at creation time. The queue applies its normal insertion and capacity rules, and automatic processing can begin immediately unless `started: false` is set.

### Results and errors

The synchronous queuer does not retain the wrapped function's return value or catch errors. It removes an item before invoking the function. If the function throws, that item is no longer queued and the error propagates from the current execution.

Use [async queuing](./pacer-docs-framework-vanilla-guides-async-queuing-md-7ba6c127.md#source-pacer-docs-framework-vanilla-guides-async-queuing-md) for Promise results, configurable error handling, retries, abort support, and concurrency.

## Ordering items

Automatic processing uses `addItemsTo` to choose where new items enter and `getItemsFrom` to choose where items leave.

### FIFO

FIFO processes the oldest item first. This is the default.

```ts
const queuer = new Queuer(processItem, {
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
const queuer = new Queuer(processItem, {
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

const queuer = new Queuer<Task>(processTask, {
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
const queuer = new Queuer(processItem, {
  wait: 1000,
})
```

Set `started: false` to collect items before processing:

```ts
const queuer = new Queuer(processItem, { started: false })

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
const queuer = new Queuer(processItem, {
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
const queuer = new Queuer(processItem, {
  expirationDuration: 5000,
  onExpire: (item) => {
    console.log('Expired:', item)
  },
})
```

Use `getIsExpired` for custom logic:

```ts
const queuer = new Queuer(processItem, {
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
const queuer = new Queuer(processItem, {
  wait: (queuer) => (queuer.store.state.size > 20 ? 50 : 250),
})
```

Use callbacks for queue events:

- `onItemsChange`: An item was added or removed.
- `onExecute`: An item was processed.
- `onReject`: An item was rejected.
- `onExpire`: An item expired.

To share a type-checked configuration across instances, define it with `queuerOptions()`.

## State

`initialState` can restore selected queue state that your app has persisted. If it includes `items`, they take precedence over `initialItems`; `initialState.isRunning` likewise takes precedence over `started`. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `items` and `size`: Items still waiting.
- `isRunning`: Whether automatic processing is enabled.
- `isIdle`: Whether a running queue is empty.
- `isFull`: Whether `maxSize` has been reached.
- `executionCount`: Items whose wrapped function returned successfully.
- `rejectionCount` and `expirationCount`: Items removed without processing.
- `status`: `'idle'`, `'running'`, or `'stopped'`.

See the [`Queuer` API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/classes/Queuer.md) for complete option and state types.
