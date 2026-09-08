# Async Retrying — Overview

[Guide and prerequisites](./pacer-docs-guides-async-retrying-md-099a4ebe.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

TanStack Pacer provides a simple `asyncRetry` utility function that wraps any async function with retry logic. This is the recommended approach for most use cases, as it creates a new retry-enabled function that can be called multiple times safely. For advanced scenarios requiring state management and reactive updates, TanStack Pacer also provides the `AsyncRetryer` class, though this requires careful usage patterns.

> [!NOTE] The AsyncRetryer API is in alpha and may change before the 1.0.0 release. The ergonomics of the API are currently suited for internal use of TanStack Pacer's other async utilities, but we have a goal of making it more ergonomic for external use as well.

Adding retry wrappers to your async functions is a great way to add a layer of robustness to your code. However, there are some important considerations to keep in mind. TanStack Pacer includes safe default options such as exponential backoff and low amount of max attempts by default to prevent overwhelming a service.

> [!NOTE] If you are already using TanStack Query, you should use the built-in retry support instead of using the AsyncRetryer from TanStack Pacer.
