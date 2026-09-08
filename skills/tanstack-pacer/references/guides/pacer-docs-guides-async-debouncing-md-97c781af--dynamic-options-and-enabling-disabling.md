# Async Debouncing — Dynamic Options and Enabling/Disabling

[Guide and prerequisites](./pacer-docs-guides-async-debouncing-md-97c781af.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Dynamic Options and Enabling/Disabling

Just like the synchronous debouncer, the async debouncer supports dynamic options for `wait` and `enabled`, which can be functions that receive the debouncer instance. This allows for sophisticated, runtime-adaptive debouncing behavior.

### Flushing Pending Executions

The async debouncer supports flushing pending executions to trigger them immediately:

```ts
const asyncDebouncer = new AsyncDebouncer(asyncFn, { wait: 1000 })

asyncDebouncer.maybeExecute('some-arg')
console.log(asyncDebouncer.store.state.isPending) // true

// Flush immediately instead of waiting
asyncDebouncer.flush()
console.log(asyncDebouncer.store.state.isPending) // false
```

### Customizing Unmount Behavior

Framework hooks cancel any pending execution and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const debouncer = useAsyncDebouncer(fn, {
  wait: 500,
  onUnmount: (d) => d.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your debounced function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.
