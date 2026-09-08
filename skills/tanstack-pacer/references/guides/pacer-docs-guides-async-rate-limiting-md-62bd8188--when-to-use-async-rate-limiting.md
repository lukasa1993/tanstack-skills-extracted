# Async Rate Limiting — When to Use Async Rate Limiting

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## When to Use Async Rate Limiting

You can usually just use the normal synchronous rate limiter and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a rate-limited function (instead of just calling a setState side effect), or putting your error handling logic in the rate limiter, you can use the async rate limiter.
