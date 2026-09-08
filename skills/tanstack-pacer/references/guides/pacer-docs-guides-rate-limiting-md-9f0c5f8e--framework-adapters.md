# Rate Limiting — Framework Adapters

[Guide and prerequisites](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Framework Adapters

Each framework adapter builds convenient hooks and functions around the rate limiter classes. Hooks like `useRateLimiter`, or `createRateLimiter` are small wrappers that can cut down on the boilerplate needed in your own code for some common use cases.

---

For asynchronous rate limiting (e.g., API calls, async operations), see the [Async Rate Limiting Guide](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md#source-pacer-docs-guides-async-rate-limiting-md).
