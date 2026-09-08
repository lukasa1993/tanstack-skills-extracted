# Async Throttling — When to Use Async Throttling

[Guide and prerequisites](./pacer-docs-guides-async-throttling-md-de3ed145.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## When to Use Async Throttling

You can usually just use the normal synchronous throttler and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a throttled function (instead of just calling a setState side effect), or putting your error handling logic in the throttler, you can use the async throttler.
