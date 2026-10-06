# Rate Limiting

<a id="source-pacer-docs-framework-react-guides-rate-limiting-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.1`.

[Topic index](../rate-limiting.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## How rate limiting works

This section is an exact duplicate. Read [How rate limiting works in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## When to use rate limiting

This section is an exact duplicate. Read [When to use rate limiting in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## Window types

This section is an exact duplicate. Read [Window types in Rate Limiting](./pacer-docs-framework-preact-guides-rate-limiting-md-2f30cd04.md).

## Choose an API

- `useRateLimitedCallback` for a quota-controlled event handler
- `useRateLimitedState` or `useRateLimitedValue` for React state
- `useRateLimiter` for capacity helpers and selected state

Use the callback API for operations, the state or value API for quota-controlled UI updates, and the instance API when you need capacity helpers or rejection state.

## React example

```tsx
import { useRateLimiter } from '@tanstack/react-pacer'

function SendButton() {
  const limiter = useRateLimiter(
    sendEvent,
    { limit: 3, window: 10_000 },
    (state) => ({
      rejectionCount: state.rejectionCount,
    }),
  )

  return (
    <button onClick={() => limiter.maybeExecute('clicked')}>
      Send ({limiter.state.rejectionCount} rejected)
    </button>
  )
}
```

The focused snippets later in this guide use `useRateLimiter` and assume they run inside a component or another hook.

## Handling rejected calls

This section is an exact duplicate. Read [Handling rejected calls in Rate Limiting](./pacer-docs-framework-preact-guides-rate-limiting-md-2f30cd04.md).

## Inspecting capacity

This section is an exact duplicate. Read [Inspecting capacity in Rate Limiting](./pacer-docs-framework-angular-guides-rate-limiting-md-3d0393c9.md).

## Resetting and configuring the limiter

This section is an exact duplicate. Read [Resetting and configuring the limiter in Rate Limiting](./pacer-docs-framework-preact-guides-rate-limiting-md-2f30cd04.md).

## React lifecycle

The adapter has no default operation cleanup because a synchronous limiter has no pending or active work. Use `onUnmount` only when the component needs custom teardown related to the limiter.

## Reactive state

The adapter subscribes only to the state returned by the selector argument. Without a selector, the adapter state is empty. Create the utility at the top level of a component or another hook and select only fields used by the view:

```ts
const limiter = useRateLimiter(
  sendEvent,
  { limit: 5, window: 60_000 },
  (state) => ({
    isExceeded: state.isExceeded,
    rejectionCount: state.rejectionCount,
  }),
)

console.log(limiter.state.isExceeded, limiter.state.rejectionCount)
```

Option functions and lifecycle callbacks receive the underlying public utility instance. The `.store.state` reads inside those callbacks in the examples above are supported. Rendering code should read the selected adapter state shown here.

To restore selected state that your app has persisted, pass a partial snapshot through `initialState`. It is merged with the defaults. Restore only durable fields. Pending timers are not restored.

Commonly useful state includes:

- `executionCount`: Total accepted executions that completed.
- `executionTimes`: Timestamps currently used for window calculations.
- `isExceeded`: Whether the current limit has been reached.
- `rejectionCount`: Calls rejected because the window was full.
- `status`: `'disabled'`, `'exceeded'`, or `'idle'`.

See the [React API reference](https://github.com/TanStack/pacer/blob/32efe7d5022c4b1ecc3d2fe3529cee2c4aab5fd2/docs/framework/react/reference/index.md) for adapter signatures and the public core reference for complete option and state types.
