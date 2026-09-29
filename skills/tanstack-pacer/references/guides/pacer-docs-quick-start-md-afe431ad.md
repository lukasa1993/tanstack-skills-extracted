# Quick Start

<a id="source-pacer-docs-quick-start-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

## Installation

Don't have TanStack Pacer installed yet? See the [Installation](./pacer-docs-installation-md-e6fbfc6c.md#source-pacer-docs-installation-md) page for instructions.

## Which utility do you need?

Not sure whether you want a debouncer, throttler, rate limiter, queuer, or batcher? Start with [Which Pacer Utility Should I Choose?](./pacer-docs-guides-which-pacer-utility-should-i-choose-md-a6a065b3.md#source-pacer-docs-guides-which-pacer-utility-should-i-choose-md). It compares all five and explains the sync, async, and framework-specific variations of each.

## API references

See the [API References](https://github.com/TanStack/pacer/blob/b58e0222da48550d4d39b6241f8ff5a4142449b6/docs/reference/index.md) page for the full API of each utility.

## Basic usage

In vanilla JavaScript, use the classes and functions from the core pacer package directly.

### Class usage

```ts
import { Debouncer } from '@tanstack/pacer' // class

const debouncer = new Debouncer(fn, options)

debouncer.maybeExecute(args) // execute the debounced function
debouncer.cancel() // cancel the debounced function
debouncer.flush() // flush the debounced function
```

### Function usage

```ts
import { debounce } from '@tanstack/pacer' // function

const debouncedFn = debounce(fn, options)

debouncedFn(args) // execute the debounced function
```

### Framework hook usage (recommended)

With a framework adapter like React, the `useDebouncer` hook creates a debounced function and cleans it up with the component lifecycle.

```tsx
import { useDebouncer } from '@tanstack/react-pacer'

const debouncer = useDebouncer(fn, options) // recommended

debouncer.maybeExecute(args) // execute the debounced function
debouncer.cancel() // cancel the debounced function
debouncer.flush() // flush the debounced function
```

### Option helpers

Each utility has an option helper for defining shared options with full type checking, so you can reuse them across instances.

```ts
import { debouncerOptions } from '@tanstack/pacer'

const commonDebouncerOptions = debouncerOptions({
  wait: 1000,
  leading: false,
  trailing: true,
})

const debouncer = new Debouncer(fn, { ...commonDebouncerOptions, key: 'myDebouncer' })
```

### Providers

Each framework adapter has a provider component for setting default options on every instance of a utility.

```tsx
import { PacerProvider } from '@tanstack/react-pacer'

// set default options for react-pacer instances
<PacerProvider defaultOptions={{ debouncer: { wait: 1000 } }}>
  <App />
</PacerProvider>
```

### Devtools

Each framework adapter has an official TanStack Devtools integration. See the [Devtools](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) page for setup instructions.
