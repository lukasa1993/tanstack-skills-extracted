# Debouncing

<a id="source-pacer-docs-framework-preact-guides-debouncing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## How debouncing works

This section is an exact duplicate. Read [How debouncing works in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## When to use debouncing

This section is an exact duplicate. Read [When to use debouncing in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## Choose an API

- `useDebouncedCallback` for a stable debounced event handler
- `useDebouncedState` or `useDebouncedValue` for delayed Preact state
- `useDebouncer` for lifecycle methods and selected state

Use the callback API for event handlers, the state or value API for delayed UI state, and the instance API when you need `cancel()`, `flush()`, selected state, or dynamic options.

## Preact example

```tsx
import { useDebouncedCallback, useDebouncer } from '@tanstack/preact-pacer'

function SearchBox() {
  const search = useDebouncedCallback(runSearch, { wait: 300 })
  const debouncer = useDebouncer(saveDraft, { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }))

  return (
    <>
      <input onChange={(event) => search(event.currentTarget.value)} />
      <button
        onClick={() => debouncer.flush()}
        disabled={!debouncer.state.isPending}
      >
        Save now
      </button>
    </>
  )
}
```

The focused snippets later in this guide use `useDebouncer` and assume they run inside a component or another hook.

## Execution timing

The `leading` and `trailing` options control which edge of the wait period may execute.

| `leading` | `trailing` | Behavior                                                                                                                               |
| --------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `false`   | `true`     | Wait for inactivity, then execute the most recent call. This is the default.                                                           |
| `true`    | `false`    | Execute the first call immediately. Later calls do not execute and restart the wait period.                                            |
| `true`    | `true`     | Execute the first call immediately. If another call arrives during the wait period, execute the most recent call at the trailing edge. |
| `false`   | `false`    | Do not execute any calls.                                                                                                              |

```ts
const debouncer = useDebouncer(saveDraft, {
  wait: 1000,
  leading: true,
  trailing: true,
})

debouncer.maybeExecute('first') // Executes immediately.
debouncer.maybeExecute('second')
debouncer.maybeExecute('latest') // Executes after 1 second of inactivity.
```

With both edges enabled, a single call executes only on the leading edge. A trailing execution occurs only when another call arrives during the wait period.

### No maximum wait

`useDebouncer` does not provide a `maxWait` option. A continuous stream of calls can keep postponing a trailing execution indefinitely. Use [throttling](./pacer-docs-framework-preact-guides-throttling-md-bb89a482.md#source-pacer-docs-framework-preact-guides-throttling-md) when work must continue at a bounded interval while calls are still arriving.

## Controlling pending work

The instance API distinguishes between executing, canceling, and resetting pending work.

### Flush

`flush()` immediately executes the pending trailing call with the most recent arguments. It does nothing when no trailing call is pending.

```ts
const debouncer = useDebouncer(saveDraft, { wait: 1000 })

debouncer.maybeExecute('draft')
debouncer.flush() // Executes saveDraft('draft') now.
```

### Cancel

`cancel()` clears the pending timeout without executing the function. It also allows a leading call to execute immediately the next time `maybeExecute()` is called.

```ts
debouncer.maybeExecute('discarded draft')
debouncer.cancel()
```

### Reset

`reset()` restores the debouncer's state counters and flags to their defaults. It does not clear an already scheduled timeout. Call `cancel()` first when you need to discard pending work and reset state.

```ts
debouncer.cancel()
debouncer.reset()
```

## Configuring behavior at runtime

Use `setOptions()` to change options after construction:

```ts
debouncer.setOptions({
  wait: 1000,
  leading: true,
  trailing: false,
})
```

A new `wait` value applies when the next call schedules a timeout. It does not reschedule a timeout that is already pending. Calling `maybeExecute()` again clears the old timeout and schedules a new one using the current options.

### Enabling and disabling

Set `enabled` to `false` to prevent execution. Disabling a debouncer through `setOptions()` also cancels its pending call.

```ts
const debouncer = useDebouncer(saveDraft, {
  wait: 500,
  enabled: false,
})

debouncer.maybeExecute('ignored')
debouncer.setOptions({ enabled: true })
debouncer.maybeExecute('saved')
```

The `enabled` and `wait` options may also be functions that receive the debouncer instance:

```ts
const debouncer = useDebouncer(saveDraft, {
  enabled: (debouncer) => debouncer.store.state.executionCount < 10,
  wait: (debouncer) => (debouncer.store.state.executionCount === 0 ? 300 : 500),
})
```

### Observing executions

Use `onExecute` for a side effect after the wrapped function runs. The callback receives the executed arguments followed by the debouncer instance.

```ts
const debouncer = useDebouncer(saveDraft, {
  wait: 500,
  onExecute: (args, debouncer) => {
    console.log('Saved arguments:', args)
    console.log('Execution count:', debouncer.store.state.executionCount)
  },
})
```

## Preact lifecycle

The adapter cancels pending work when its owner is destroyed. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. When custom cleanup flushes work, remember that user callbacks can run while the component is being destroyed.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const debouncer = useDebouncer(saveDraft, { wait: 500 }, (state) => ({
  isPending: state.isPending,
  executionCount: state.executionCount,
}))

console.log(debouncer.state.isPending, debouncer.state.executionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

- `isPending`: Whether a trailing execution is waiting.
- `executionCount`: How many times the wrapped function has executed.
- `lastArgs`: The arguments recorded by the most recent trailing-enabled call. Check `isPending` before treating them as pending work.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [Preact API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/preact/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
