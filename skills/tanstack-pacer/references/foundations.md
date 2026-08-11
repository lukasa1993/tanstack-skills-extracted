# Foundations and selection

Installation, quick start, overview, devtools, and utility selection.

<a id="source-pacer-docs-devtools-md"></a>

## Devtools

Source: `pacer:docs/devtools.md`.

What? My debouncer can have dedicated devtools? Yep!

TanStack Pacer provides devtools for debugging and monitoring all your utilities in real-time. The devtools integrate seamlessly within the new [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> By default, the TanStack Devtools and TanStack Pacer Devtools will only be included in development mode. This helps keep your production bundle size minimal. If you need to include devtools in production builds (e.g., for debugging production issues), you can use the alternative "production" imports.

### Installation

Install the devtools packages for your framework:

#### React

```sh
npm install @tanstack/react-devtools @tanstack/react-pacer-devtools
```

#### Solid

```sh
npm install @tanstack/solid-devtools @tanstack/solid-pacer-devtools
```

#### Angular

Coming soon...

### Basic Setup

#### React Setup

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'

function App() {
  return (
    <div>
      {/* Your app content */}

      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </div>
  )
}
```

#### Solid Setup

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { pacerDevtoolsPlugin } from '@tanstack/solid-pacer-devtools'

function App() {
  return (
    <div>
      {/* Your app content */}

      <TanStackDevtools
        eventBusConfig={{
          debug: false,
        }}
        plugins={[pacerDevtoolsPlugin()]}
      />
    </div>
  )
}
```

### Production Builds

By default, devtools are excluded from production builds to minimize bundle size. The default imports will return no-op implementations in production:

```tsx
// This will be a no-op in production builds
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools'
```

If you need to include devtools in production builds (e.g., for debugging production issues), use the production-specific imports:

```tsx
// This will include full devtools even in production builds
import { pacerDevtoolsPlugin } from '@tanstack/react-pacer-devtools/production'
```

### Registering Utilities

Pacer utilities only register with the devtools when you pass a `key`. Keys are no longer generated automatically, so leave the option out if you do not want an instance to appear in the panels.

```tsx
const debouncer = new Debouncer(myDebounceFn, {
  key: 'My Debouncer', // friendly name shown in the devtools
  wait: 1000,
})
```

<a id="source-pacer-docs-guides-which-pacer-utility-should-i-choose-md"></a>

## Which Pacer Utility Should I Choose

Source: `pacer:docs/guides/which-pacer-utility-should-i-choose.md`.

TanStack Pacer provides 5 core utilities for controlling function execution frequency. Here is a one-sentence summary of each utility:

 - [**Debouncer**](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) - Executes a function after a period of inactivity. (Rejects other calls during activity)
 - [**Throttler**](./debounce-throttle.md#source-pacer-docs-guides-throttling-md) - Executes a function at regular intervals. (Rejects all but one call during each interval)
 - [**Rate Limiter**](./rate-limiting.md#source-pacer-docs-guides-rate-limiting-md) - Prevents a function from being called too frequently. (Rejects calls when the limit is reached)
 - [**Queuer**](./queue-batch.md#source-pacer-docs-guides-queuing-md) - Processes all calls to a function in order. (Only rejects calls if the queue is full)
 - [**Batcher**](./queue-batch.md#source-pacer-docs-guides-batching-md) - Groups multiple function calls into a single batch. (No rejections)

After choosing which strategy fits your needs, there are additional variations and decisions to consider. This guide provides quick clarifications on the most common decisions you'll need to make.

### Synchronous vs Asynchronous

You may see both a [Debouncer](./debounce-throttle.md#source-pacer-docs-guides-debouncing-md) and an [Async Debouncer](./debounce-throttle.md#source-pacer-docs-guides-async-debouncing-md) when first exploring TanStack Pacer. Which one should you use?

Each utility comes in both synchronous and asynchronous versions. For most use cases, the simpler synchronous version is sufficient. However, if you need these utilities to handle async logic for you, the complexity of each utility increases significantly. The bundle size of the asynchronous versions of each utility is often more than double the size of the synchronous versions. If you actually need and use some of these additional APIs, the extra complexity is worth it, but don't choose the asynchronous version of a utility unless you actually end up using these features.

> [!TIP] We recommend using the simpler synchronous version of each utility for most use cases. (Debouncer, Throttler, Rate Limiter, Queuer, Batcher)

Luckily, switching between the synchronous and asynchronous versions of a utility is straightforward. For the most part, just replace the import whenever you decide you need to switch.

#### When to Use the Asynchronous Version

Use the asynchronous version when you need any of these capabilities:

- **Await Return Values**: Await and use the return value from your function, rather than just calling it for side effects. The synchronous version returns void, while the async version returns a Promise that resolves with your function's result. You can also await the return value to determine when to send another execution when execution order matters.

- **Error Handling**: Built-in error handling with configurable error callbacks, control over whether errors are thrown or swallowed, and error statistics tracking.

- **Extra Callbacks**: Instead of just an `onExecute` callback that comes with the synchronous version, the asynchronous version comes with additional callbacks such as `onSuccess`, `onError`, `onSettled`, and `onAbort`.

- **Concurrency**: For queuing specifically, concurrency support allowing multiple items to be processed simultaneously while maintaining control over how many run at once.

- **Retries and Aborts**: Built-in integration with `AsyncRetryer` for automatic retries of failed executions with configurable backoff strategies, jitter, and retry limits. Cancel in-flight operations using AbortController.

### Pacer Lite vs Pacer

Pacer Lite (`@tanstack/pacer-lite`) is a stripped-down version of the core TanStack Pacer library. It is designed to be used in libraries and npm packages that need minimal overhead and no reactivity features. The Lite version of each utility has the same core functionality as its core counterpart, but with a smaller API surface and a smaller bundle size. Pacer Lite lacks reactivity features, framework adapters, devtools support, and some of the advanced options that the core utilities have.

If you are building an application, use the normal `@tanstack/pacer` package (or your framework adapter like `@tanstack/react-pacer` for React, `@tanstack/solid-pacer` for Solid, etc.). Only use Pacer Lite if you are building a library or npm package that needs to be as lightweight as possible and doesn't need the extra features of the core utilities.

### Which Hook Variation Should I Use?

We will use the Debouncer utility as the main example, but the same principles apply to all the other utilities.

If you are using a framework adapter like React, you will see that there are lots of examples with multiple hook variations. For example, for debouncing you will see:

- [`useDebouncer`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncer/README.md)
- [`useDebouncedCallback`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncedCallback/README.md)
- [`useDebouncedState`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncedState/README.md)
- [`useDebouncedValue`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncedValue/README.md)

You will also probably see that you can use the core `Debouncer` class directly or the core `debounce` function directly without using a hook.

These are all variations of the same basic debouncing functionality. So, which one should you use?

The answer is: It Depends! 🤷‍♂️

But also: It doesn't really matter too much. They all do essentially the same thing. It's mostly a matter of personal preference and how you want to interact with the utility. Under the hood, a `Debouncer` instance is created no matter what you choose.

You can start with the [`useDebouncer`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncer/README.md) hook if you don't know which one to use. All of the others wrap the `useDebouncer` hook with different argument and return value signatures.

```tsx
import { useDebouncer } from '@tanstack/react-pacer'
//...
const debouncer = useDebouncer(fn, options)

debouncer.maybeExecute(args) // execute the debounced function
//...
debouncer.cancel() // use Debouncer APIs with full access to the debouncer instance
debouncer.flush()
```

If you only need to create a debounced function and don't need access to the debouncer instance to call methods or use its extra features, use the [`useDebouncedCallback`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncedCallback/README.md) hook. The `*Callback` versions of the hooks are actually most similar to calling the core functions directly (like `debounce`) but with the memoization setup taken care of for you.

```tsx
import { useDebouncedCallback } from '@tanstack/react-pacer'
//...
const debouncedFn = useDebouncedCallback(fn, options)

debouncedFn(args) // execute the debounced function
//...
```

The other variations are convenience hooks that wrap the `useDebouncer` hook with different argument and return value signatures. For example, the [`useDebouncedState`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncedState/README.md) hook is useful when you need to debounce a state value.

```tsx
import { useDebouncedState } from '@tanstack/react-pacer'
//...
const [debouncedValue, setDebouncedValue] = useDebouncedState(value, options)

setDebouncedValue(newValue) // set the debounced value (will be debounced state setter)
//...
```

The [`useDebouncedValue`](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/useDebouncedValue/README.md) hook is useful when your debounced value is derived from an instant value that changes frequently.

```tsx
import { useDebouncedValue } from '@tanstack/react-pacer'
//...
const [instantValue, setInstantValue] = useState(0)
const [debouncedValue] = useDebouncedValue(instantValue, options)
//...
setInstantValue(newValue) // Set the instant value; the debounced value will update automatically, delayed by the wait time
//...
```

<a id="source-pacer-docs-installation-md"></a>

## Installation

Source: `pacer:docs/installation.md`.

TanStack Pacer is compatible with various front-end frameworks. Install the corresponding adapter for your framework using your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

react: @tanstack/react-pacer
solid: @tanstack/solid-pacer
angular: @tanstack/angular-pacer

<!-- ::end:tabs -->

Each framework package re-exports everything from the core `@tanstack/pacer` package, so there is no need to install the core package separately.

> [!NOTE]
> If you are not using a framework, you can install the core `@tanstack/pacer` package directly for use with vanilla JavaScript.

<!-- ::start:framework -->

## React

### Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Pacer devtools plugin as dev dependencies to inspect and monitor your pacers.

## Solid

### Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Pacer devtools plugin as dev dependencies to inspect and monitor your pacers.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-pacer-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-pacer-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

## React

See the [devtools](./foundations.md#source-pacer-docs-devtools-md) documentation for more information on how to set up and use the Pacer devtools.

## Solid

See the [devtools](./foundations.md#source-pacer-docs-devtools-md) documentation for more information on how to set up and use the Pacer devtools.

<!-- ::end:framework -->

<a id="source-pacer-docs-overview-md"></a>

## Overview

Source: `pacer:docs/overview.md`.

TanStack Pacer is a library focused on providing high-quality utilities for controlling function execution timing in your applications. While similar utilities exist elsewhere, we aim to get all the important details right - including ***type-safety***, ***tree-shaking***, and a consistent and ***intuitive API***. By focusing on these fundamentals and making them available in a ***framework agnostic*** way, we hope to make these utilities and patterns more commonplace in your applications. Proper execution control is often an afterthought in application development, leading to performance issues, race conditions, and poor user experiences that could have been prevented. TanStack Pacer helps you implement these critical patterns correctly from the start!

> [!IMPORTANT]
> TanStack Pacer is currently in **beta** and its API is still subject to change.
>
> The scope of this library may grow, but we hope to keep the bundle size of each individual utility lean and focused.

### Origin

Many of the ideas (and code) for TanStack Pacer are not new. In fact, many of these utilities have been living in other TanStack libraries for quite some time. We extracted code from TanStack Query, Router, Form, and even Tanner's original [Swimmer](https://github.com/tannerlinsley/swimmer) library. Then we cleaned up these utilities, filled in some gaps, and shipped them as a standalone library.

### Features

> [!NOTE]
> TanStack Pacer is currently mostly a client-side only library, but it is being designed to be able to potentially be used on the server-side as well.

- **Debouncing**
  - Delay execution until after a period of inactivity for when you only care about the last execution in a sequence.
  - Synchronous or Asynchronous Debounce utilities with promise support and error handling
  - Control of leading, trailing, and enabled options
- **Throttling**
  - Smoothly limit the rate at which a function can fire
  - Synchronous or Asynchronous Throttle utilities with promise support and error handling
  - Control of leading, trailing, and enabled options.
- **Rate Limiting**
  - Limit the rate at which a function can fire over a period of time
  - Synchronous or Asynchronous Rate Limiting utilities with promise support and error handling
  - Fixed or Sliding Window variations of Rate Limiting
- **Queuing**
  - Queue functions to be executed in a specific order
  - Choose from FIFO, LIFO, and Priority queue implementations
  - Control processing speed with configurable wait times or concurrency limits
  - Manage queue execution with start/stop capabilities
  - Expire items from the queue after a configurable duration
- **Batching**
  - Chunk up multiple operations into larger batches to reduce total back-and-forth operations
  - Batch by time period, batch size, whichever comes first, or a custom condition to trigger batch executions
- **Async or Sync Variations**
  - Choose between synchronous and asynchronous versions of each utility
  - Optional error, success, and settled handling for async variations
  - Retry and Abort support for async variations
- **State Management**
  - Uses TanStack Store under the hood for state management with fine-grained reactivity
  - Easily integrate with your own state management library of choice
  - Persist state to local or session storage for some utilities like rate limiting and queuing
- **Convenient Hooks**
  - Reduce boilerplate code with pre-built hooks like `useDebouncedCallback`, `useThrottledValue`, and `useQueuedState`, and more.
  - Multiple layers of abstraction to choose from depending on your use case.
  - Works with each framework's default state management solutions, or with whatever custom state management library that you prefer.
- **Type Safety**
  - Full type safety with TypeScript that makes sure that your functions will always be called with the correct arguments
  - Generics for flexible and reusable utilities
- **Framework Adapters**
  - React, Solid, and more
- **Tree Shaking**
  - We, of course, get tree-shaking right for your applications by default, but we also provide extra deep imports for each utility, making it easier to embed these utilities into your libraries without increasing the bundle-phobia reports of your library.

### Interactive Comparison Demo

Each utility is designed to be used in a specific way, and each utility has its own unique behavior.

See how each utility behaves with this interactive comparison. Move the range slider to observe the differences between debouncing, throttling, rate limiting, queuing, and batching:

<iframe src="https://stackblitz.com/github/TanStack/pacer/tree/c75895520669b08dc8946b42e1a6d529ca977230/examples/react/util-comparison?embed=1&view=preview&hideNavigation=1" width="100%" height="1200px" style="border: 1px solid #ccc; border-radius: 4px;"></iframe>

### Pacer Lite

Pacer Lite (`@tanstack/pacer-lite`) is a stripped down version of the core TanStack Pacer library. It is designed to be used in libraries and npm packages that need minimal overhead, and no reactivity features. The Lite version of each utility has the same core functionality of its core counterpart, but is stripped down to have a slightly smaller API surface and a smaller bundle size. Pacer Lite lacks reactivity features, framework adapters, devtools support, and some of the advanced options that the core utilities have. If that sounds interesting to you, you can feel free to try it out!

<a id="source-pacer-docs-quick-start-md"></a>

## Quick Start

Source: `pacer:docs/quick-start.md`.

### Installation

Don't have TanStack Pacer installed yet? See the [Installation](./foundations.md#source-pacer-docs-installation-md) page for instructions.

### Understanding Which Pacer Utility to Use

Still learning what TanStack Pacer is and how it can help your application? See the [Which Pacer Utility Should I Choose?](./foundations.md#source-pacer-docs-guides-which-pacer-utility-should-i-choose-md) guide for help choosing which Pacer utility to use. The TanStack Pacer libraries have 5 core utilities, but also quite a few flexible ways to use each utility. Famarilizing yourself with the above guide will help you choose the right utility for your use case.

### API References

See the [API References](https://github.com/TanStack/pacer/blob/c75895520669b08dc8946b42e1a6d529ca977230/docs/reference/index.md) page for the full list of API references for each Pacer utility.

### Basic Usage

If you are using vanilla JavaScript, there are core classes and functions that you can use from the core pacer package.

#### Class Usage

```ts
import { Debouncer } from '@tanstack/pacer' // class

const debouncer = new Debouncer(fn, options)

debouncer.maybeExecute(args) // execute the debounced function
debouncer.cancel() // cancel the debounced function
debouncer.flush() // flush the debounced function
```

#### Function Usage

```ts
import { debounce } from '@tanstack/pacer' // function

const debouncedFn = debounce(fn, options)

debouncedFn(args) // execute the debounced function
```

#### Framework Hook Usage (Recommended)

If you are using a framework adapter like React, you can use the `useDebouncer` hook to create a debounced function.

```tsx
import { useDebouncer } from '@tanstack/react-pacer'

const debouncer = useDebouncer(fn, options) // recommended

debouncer.maybeExecute(args) // execute the debounced function
debouncer.cancel() // cancel the debounced function
debouncer.flush() // flush the debounced function
```

#### Option Helpers

If want a type-safe way to define common options for pacer utilities, TanStack Pacer provides option helpers for each utility.

```ts
import { debouncerOptions } from '@tanstack/pacer'

const commonDebouncerOptions = debouncerOptions({
  wait: 1000,
  leading: false,
  trailing: true,
})

const debouncer = new Debouncer(fn, { ...commonDebouncerOptions, key: 'myDebouncer' })
```

#### Providers

In each framework adapter, there is a provider component that you can use to provide default options to all instances of a pacer utility.

```tsx
import { PacerProvider } from '@tanstack/react-pacer'

// set default options for react-pacer instances
<PacerProvider defaultOptions={{ debouncer: { wait: 1000 } }}>
  <App />
</PacerProvider>
```

#### Devtools

TanStack Pacer provides an official TanStack Devtools integration for each framework adapter. See the [Devtools](./foundations.md#source-pacer-docs-devtools-md) documentation for more information on how to set up and use the Pacer devtools.
