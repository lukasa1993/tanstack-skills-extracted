# Async Rate Limiting — Framework Adapters

[Guide and prerequisites](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## Framework Adapters

Each framework adapter provides hooks that build on top of the core async rate limiting functionality to integrate with the framework's state management system. Hooks like `createAsyncRateLimiter`, `useAsyncRateLimitedCallback`, or similar are available for each framework.

---

For core rate limiting concepts and synchronous rate limiting, see the [Rate Limiting Guide](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md#source-pacer-docs-guides-rate-limiting-md).
