# Which Pacer Utility Should I Choose

<a id="source-pacer-docs-guides-which-pacer-utility-should-i-choose-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

TanStack Pacer provides five strategies for controlling when operations run. The right choice depends on what should happen to calls that arrive faster than your application can process them.

## Compare the utilities

| Utility | What happens to frequent calls? | Best fit |
| --- | --- | --- |
| [Debouncer](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) | Earlier calls are discarded. The latest call runs after activity stops. | Search input, validation, autosave |
| [Throttler](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) | Calls are limited to a steady interval. A trailing call can retain the latest arguments. | Scroll, resize, progress, repeated UI updates |
| [Rate Limiter](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md#source-pacer-docs-guides-rate-limiting-md) | Calls run until a quota is reached. Additional calls are rejected until capacity returns. | Client-side quotas and burst limits |
| [Queuer](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) | Calls wait in an ordered buffer and run individually. | Work that must not be lost |
| [Batcher](./pacer-docs-guides-batching-md-c3c877da.md#source-pacer-docs-guides-batching-md) | Items accumulate and run together as one batch. | Bulk requests, writes, and analytics events |

## Choose by required behavior

### Only the final value matters

Use a [debouncer](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md). Every call restarts a timer, and the most recent call runs once the calls go quiet.

### Work should continue at a steady pace

Use a [throttler](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md). It limits execution frequency without waiting for activity to stop completely.

### A fixed quota must be enforced

Use a [rate limiter](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md#source-pacer-docs-guides-rate-limiting-md). It accepts calls until the configured limit is reached, then rejects additional calls within the window.

### Every operation must run

Use a [queuer](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md). It preserves pending operations and processes them according to FIFO, LIFO, or priority ordering. A finite `maxSize` can still cause new items to be rejected.

### Several items should run together

Use a [batcher](./pacer-docs-guides-batching-md-c3c877da.md#source-pacer-docs-guides-batching-md). It collects items until a size, time, or custom condition triggers one batch execution.

## Synchronous or asynchronous

Each utility has a synchronous and asynchronous version. Start with the synchronous version unless the utility must manage Promise-specific behavior.

Use the asynchronous version when you need to:

- Await the wrapped function's result.
- Track success, error, and settlement state.
- Configure error propagation.
- Retry failed executions.
- Abort in-flight operations.
- Run queued tasks concurrently with `AsyncQueuer`.

Passing an async function to a synchronous utility does not provide these features. The synchronous utility invokes the function but does not await or manage its Promise.

| Synchronous | Asynchronous |
| --- | --- |
| [Debouncing](./pacer-docs-guides-debouncing-md-2946516b.md#source-pacer-docs-guides-debouncing-md) | [Async debouncing](./pacer-docs-guides-async-debouncing-md-97c781af.md#source-pacer-docs-guides-async-debouncing-md) |
| [Throttling](./pacer-docs-guides-throttling-md-b3667c78.md#source-pacer-docs-guides-throttling-md) | [Async throttling](./pacer-docs-guides-async-throttling-md-de3ed145.md#source-pacer-docs-guides-async-throttling-md) |
| [Rate limiting](./pacer-docs-guides-rate-limiting-md-9f0c5f8e.md#source-pacer-docs-guides-rate-limiting-md) | [Async rate limiting](./pacer-docs-guides-async-rate-limiting-md-62bd8188.md#source-pacer-docs-guides-async-rate-limiting-md) |
| [Queuing](./pacer-docs-guides-queuing-md-4661e110.md#source-pacer-docs-guides-queuing-md) | [Async queuing](./pacer-docs-guides-async-queuing-md-388e02df.md#source-pacer-docs-guides-async-queuing-md) |
| [Batching](./pacer-docs-guides-batching-md-c3c877da.md#source-pacer-docs-guides-batching-md) | [Async batching](./pacer-docs-guides-async-batching-md-151108d1.md#source-pacer-docs-guides-async-batching-md) |

The async utilities use [`AsyncRetryer`](./pacer-docs-guides-async-retrying-md-099a4ebe.md#source-pacer-docs-guides-async-retrying-md) internally for retry and abort support.

## Core package or framework adapter

Use `@tanstack/pacer` when you need the core classes and functions without component lifecycle integration.

Use a framework adapter in an application that needs automatic cleanup and reactive state:

- [React adapter](./pacer-docs-framework-react-adapter-md-526adec5.md#source-pacer-docs-framework-react-adapter-md)
- [Preact adapter](./pacer-docs-framework-preact-adapter-md-cfba1f1c.md#source-pacer-docs-framework-preact-adapter-md)
- [Solid adapter](./pacer-docs-framework-solid-adapter-md-b0b7bf51.md#source-pacer-docs-framework-solid-adapter-md)
- [Angular adapter](./pacer-docs-framework-angular-adapter-md-f68875f2.md#source-pacer-docs-framework-angular-adapter-md)

Framework adapters provide several API shapes around the same underlying utility:

- Instance APIs such as `useDebouncer` expose lifecycle methods and selected state.
- Callback APIs such as `useDebouncedCallback` return a function to call.
- State and value APIs connect the utility to framework state.

Choose the narrowest API that provides the control you need. Use the instance API when you need methods such as `cancel()` or `flush()`.

## Pacer Lite or Pacer

`@tanstack/pacer-lite` is intended for libraries that need smaller, non-reactive utilities. It omits TanStack Store integration, framework adapters, Devtools support, and some advanced options.

Use the regular core package or a framework adapter for application code. Consider Pacer Lite when bundle size is the primary constraint and reactive state is unnecessary.
