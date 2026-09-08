# Async Throttling — Dynamic Options and Enabling/Disabling

[Guide and prerequisites](./pacer-docs-guides-async-throttling-md-de3ed145.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Dynamic Options and Enabling/Disabling

Just like the synchronous throttler, the async throttler supports dynamic options for `wait` and `enabled`, which can be functions that receive the throttler instance. This allows for sophisticated, runtime-adaptive throttling behavior.

### Flushing Pending Executions

The async throttler supports flushing pending executions to trigger them immediately:

```ts
const asyncThrottler = new AsyncThrottler(asyncFn, { wait: 1000 })

asyncThrottler.maybeExecute('some-arg')
console.log(asyncThrottler.store.state.isPending) // true

// Flush immediately instead of waiting
asyncThrottler.flush()
console.log(asyncThrottler.store.state.isPending) // false
```

### Customizing Unmount Behavior

Framework hooks cancel any pending execution and abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to flush instead of canceling.

```tsx
const throttler = useAsyncThrottler(fn, {
  wait: 500,
  onUnmount: (t) => t.flush(),
})
```

> **Warning:** For async utils, `flush()` returns a Promise and runs fire-and-forget in the cleanup. If your throttled function updates React/Preact state or Solid signals, those updates may run after the component has unmounted, which can cause "setState on unmounted component" warnings or unexpected reactive updates. Guard your callbacks accordingly.
