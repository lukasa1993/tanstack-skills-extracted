# Debouncing

<a id="source-pacer-docs-framework-react-guides-debouncing-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../debounce-throttle.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## How debouncing works

This section is an exact duplicate. Read [How debouncing works in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## When to use debouncing

This section is an exact duplicate. Read [When to use debouncing in Debouncing](./pacer-docs-framework-angular-guides-debouncing-md-982e1c29.md).

## Using debouncing in React

The React adapter provides three levels of debouncing API:

- `useDebouncedCallback` creates a stable debounced event handler.
- `useDebouncedState` and `useDebouncedValue` delay state or a changing value.
- `useDebouncer` exposes lifecycle methods, dynamic options, callbacks, and selected state.

Call these hooks at the top level of a component or another hook. The focused examples later in this guide assume they run in that context.

### Debounced callback

Use `useDebouncedCallback` when an event should invoke a debounced side effect:

```tsx
import { useDebouncedCallback } from '@tanstack/react-pacer'

function SearchBox() {
  const search = useDebouncedCallback(
    (query: string) => updateSearchResults(query),
    { wait: 500 },
  )

  return (
    <input
      onChange={(event) => search(event.currentTarget.value)}
      placeholder="Search"
    />
  )
}
```

The callback does not expose `cancel()` or `flush()`. Use `useDebouncer` when the component needs that control.

### Debounced state and values

Use `useDebouncedState` when Pacer should own the delayed state, or `useDebouncedValue` when a value already changes elsewhere:

```tsx
import { useDebouncedValue } from '@tanstack/react-pacer'

function Results({ query }: { query: string }) {
  const [debouncedQuery] = useDebouncedValue(query, { wait: 500 })

  return <SearchResults query={debouncedQuery} />
}
```

### Instance API

```tsx
import { useDebouncer } from '@tanstack/react-pacer'

function SaveControls() {
  const debouncer = useDebouncer(saveDraft, { wait: 500 }, (state) => ({
    isPending: state.isPending,
  }))

  return (
    <button
      disabled={!debouncer.state.isPending}
      onClick={() => debouncer.flush()}
    >
      Save now
    </button>
  )
}
```

Both the callback and `maybeExecute()` return `void`. The synchronous adapter does not retain return values or catch errors. Handle errors inside a trailing callback, or use [async debouncing](./pacer-docs-framework-react-guides-async-debouncing-md-110609a3.md#source-pacer-docs-framework-react-guides-async-debouncing-md) when the caller needs a Promise result.

## Execution timing

This section is an exact duplicate. Read [Execution timing in Debouncing](./pacer-docs-framework-preact-guides-debouncing-md-8452f839.md).

## Controlling pending work

This section is an exact duplicate. Read [Controlling pending work in Debouncing](./pacer-docs-framework-preact-guides-debouncing-md-8452f839.md).

## Configuring behavior at runtime

This section is an exact duplicate. Read [Configuring behavior at runtime in Debouncing](./pacer-docs-framework-preact-guides-debouncing-md-8452f839.md).

## React lifecycle

The adapter cancels pending work when the component unmounts. Providing `onUnmount` replaces that default cleanup, so a custom callback must perform every required lifecycle action. This matters most when flushing during unmount because callbacks may run after the component has begun tearing down.

## Reactive state

The adapter exposes reactive state only through the selector passed as the third argument. Without a selector, `debouncer.state` is an empty object. Select only fields used by the component:

```tsx
const debouncer = useDebouncer(fn, options, (state) => ({
  isPending: state.isPending,
  executionCount: state.executionCount,
}))

console.log(debouncer.state.isPending, debouncer.state.executionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Component rendering should use selected adapter state.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

- `isPending`: Whether a trailing execution is waiting.
- `executionCount`: How many times the wrapped function has executed.
- `lastArgs`: The arguments recorded by the most recent trailing-enabled call. Check `isPending` before treating them as pending work.
- `status`: `'disabled'`, `'idle'`, or `'pending'`.

See the [React API reference](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
