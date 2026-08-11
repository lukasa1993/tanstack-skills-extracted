# Foundations

Core Store, atoms, selectors, batching, and async state.

<a id="source-store-docs-installation-md"></a>

## Installation

Source: `store:docs/installation.md`.

You can install TanStack Store with any [NPM](https://npmjs.com) package manager.

### React

```sh
npm install @tanstack/react-store
```

TanStack Store is compatible with React v16.8+ and is currently only compatible with ReactDOM only. If you would like to contribute to the React Native adapter, please reach out to us on [Discord](https://tlinz.com/discord).

### Preact

```sh
npm install @tanstack/preact-store
```

TanStack Store is compatible with Preact 10+.

### Vue

```sh
npm install @tanstack/vue-store
```

TanStack Store is compatible with Vue 2 and 3.

### Angular

```sh
npm install @tanstack/angular-store
```

TanStack Store is compatible with Angular 19+

### SolidJS

```sh
npm install @tanstack/solid-store
```

TanStack Store is compatible with Solid and SolidStart.

### Svelte

```sh
npm install @tanstack/svelte-store
```

TanStack Store is compatible with Svelte 5.

### Lit

```sh
npm install @tanstack/lit-store
```

TanStack Store is compatible with Lit 3.

### Octane

```sh
npm install @tanstack/octane-store
```

TanStack Store is compatible with Octane 0.1.21.

<a id="source-store-docs-overview-md"></a>

## Overview

Source: `store:docs/overview.md`.

TanStack Store is a framework-agnostic data store that ships with framework-specific adapters for major frameworks like React, Solid, Vue, Angular, Svelte, Lit, and Octane.

TanStack Store is primarily used for state management internally for most framework agnostic TanStack libraries. It can also be used as a standalone library for any framework or application.

<a id="source-store-docs-quick-start-md"></a>

## Quick Start

Source: `store:docs/quick-start.md`.

TanStack Store is, first and foremost, a framework-agnostic signals implementation.

It can be used with any of our framework adapters, but can also be used in vanilla JavaScript or TypeScript. It's currently used to power many of our library's internals.

### Store

You'll start by creating a new store instance, which is a wrapper around your data:

```typescript
import { createStore } from '@tanstack/store';

const countStore = createStore(0);

console.log(countStore.state); // 0
countStore.setState(() => 1);
console.log(countStore.state); // 1
```

This `Store` can then be used to track updates to your data:

```typescript
const {unsubscribe} = countStore.subscribe(() => {
  console.log('The count is now:', countStore.state);
});

// Later, to cleanup
unsubscribe();
```

#### Batch Updates

You can batch updates to a store by using the `batch` function:

```typescript
import { batch } from '@tanstack/store';

// countStore.subscribers will only trigger once at the end with the final state
batch(() => {
  countStore.setState(() => 1);
  countStore.setState(() => 2);
});
```

### Derived Stores

You can create derived stores that automatically update when their dependencies change:

```typescript
const count = createStore(0);

const double = createStore(() => count.state * 2);

console.log(double.state); // 0
count.setState(() => 5);
console.log(double.state); // 10
```

#### Previous Derived Value

You can access the previous value of a derived computation by using the `prev` argument passed to the function:

```typescript
const count = createStore(1);

const sum = createStore<number>((prev) => {
  return count.state + (prev ?? 0);
});

console.log(sum.state); // 1
count.setState(() => 2);
console.log(sum.state); // 3
```

### Subscriptions

You can subscribe to store changes to perform side effects:

```typescript
const count = createStore(0);

const {unsubscribe} = count.subscribe((state) => {
  console.log('The count is now:', state);
});

count.setState(() => 5); // Logs: "The count is now: 5"

// Later, to cleanup
unsubscribe();
```
