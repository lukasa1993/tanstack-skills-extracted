# Async Rate Limiting — Dynamic Options and Enabling/Disabling

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Dynamic Options and Enabling/Disabling

Just like the synchronous rate limiter, the async rate limiter supports dynamic options for `limit`, `window`, and `enabled`, which can be functions that receive the rate limiter instance. This allows for sophisticated, runtime-adaptive rate limiting behavior.

### Customizing Unmount Behavior

Framework hooks abort any in-flight execution by default when a component unmounts. The automatic abort only cancels underlying operations (e.g. fetch) when the abort signal from `getAbortSignal()` is passed to them. Use the `onUnmount` option to customize this behavior.
