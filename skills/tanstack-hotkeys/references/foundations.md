# Foundations

Overview, installation, and devtools.

<a id="source-hotkeys-docs-devtools-md"></a>

## Devtools

Source: `hotkeys:docs/devtools.md`.

TanStack Hotkeys provides devtools for debugging and monitoring all your registered hotkeys in real-time. The devtools integrate seamlessly within the [TanStack Devtools](https://tanstack.com/devtools) multi-panel UI.

> [!NOTE]
> By default, the TanStack Devtools and TanStack Hotkeys Devtools will only be included in development mode. This helps keep your production bundle size minimal. If you need to include devtools in production builds (e.g., for debugging production issues), you can use the alternative "production" imports.

### Features

The Hotkeys devtools panel provides:

- **Registered Hotkeys List** - View all currently registered hotkeys with their options and status
- **Held Keys Display** - See which keys are currently being held down in real-time
- **Trigger Hotkeys** - Programmatically trigger hotkey callbacks for testing without pressing keys
- **Registration Details** - Inspect individual hotkey registrations including their target, event type, and conflict behavior

### Installation

Install the devtools packages for your framework:

#### React

```sh
npm install @tanstack/react-devtools @tanstack/react-hotkeys-devtools
```

#### Preact

```sh
npm install @tanstack/preact-devtools @tanstack/preact-hotkeys-devtools
```

#### Solid

```sh
npm install @tanstack/solid-devtools @tanstack/solid-hotkeys-devtools
```

#### Vue

```sh
npm install @tanstack/vue-hotkeys-devtools
```

Angular and Lit do not currently ship a dedicated hotkeys devtools adapter.

### Setup

#### React Setup

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

#### Preact Setup

```tsx
import { TanStackDevtools } from '@tanstack/preact-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/preact-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

#### Solid Setup

```tsx
import { TanStackDevtools } from '@tanstack/solid-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/solid-hotkeys-devtools'

export function App() {
  return <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
}
```

#### Vue Setup

```vue
<script setup lang="ts">
import { HotkeysDevtoolsPanel } from '@tanstack/vue-hotkeys-devtools'
</script>

<template>
  <AppContent />
  <HotkeysDevtoolsPanel />
</template>
```

For React, Preact, and Solid, the Hotkeys panel appears alongside any other TanStack devtools plugins you have installed.

### Production Builds

By default, the framework devtools adapters return no-op implementations in production builds so they do not affect your production bundle behavior.

React additionally exposes a production import when you explicitly want to include the plugin in production:

```tsx
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools/production'
```

<a id="source-hotkeys-docs-installation-md"></a>

## Installation

Source: `hotkeys:docs/installation.md`.

TanStack Hotkeys is compatible with various front-end frameworks. Install the corresponding adapter for your framework using your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

angular: @tanstack/angular-hotkeys
lit: @tanstack/lit-hotkeys
preact: @tanstack/preact-hotkeys
react: @tanstack/react-hotkeys
solid: @tanstack/solid-hotkeys
vue: @tanstack/vue-hotkeys

<!-- ::end:tabs -->

Each framework package re-exports everything from the core `@tanstack/hotkeys` package, so there is no need to install the core package separately.

> [!NOTE]
> If you are not using a framework, you can install the core `@tanstack/hotkeys` package directly for use with vanilla JavaScript.

<!-- ::start:framework -->

## React

Start with the [Quick Start](./framework-react.md#source-hotkeys-docs-framework-react-quick-start-md) guide. If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

## Preact

Start with the [API reference](https://github.com/TanStack/hotkeys/blob/c73a3a167c979d500e1008341ecad096a6c4e635/docs/framework/preact/reference/index.md) and [guides](./framework-preact.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

## Solid

Start with the [API reference](https://github.com/TanStack/hotkeys/blob/c73a3a167c979d500e1008341ecad096a6c4e635/docs/framework/solid/reference/index.md) and [guides](./framework-solid.md#source-hotkeys-docs-framework-solid-guides-hotkeys-md). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

## Angular

Start with the [Quick Start](./framework-angular.md#source-hotkeys-docs-framework-angular-quick-start-md) guide and the Angular-specific [guides](./framework-angular.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md).

Angular currently ships the hotkeys adapter only, so no dedicated Angular devtools package is required.

<!-- ::end:framework -->

<!-- ::start:framework -->

## Vue

Start with the [Quick Start](./framework-vue.md#source-hotkeys-docs-framework-vue-quick-start-md) guide and the Vue-specific [guides](./framework-vue.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md).

If you want the Vue devtools panel component, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

## Lit

Start with the [Quick Start](./framework-lit.md#source-hotkeys-docs-framework-lit-quick-start-md) guide and the Lit-specific [guides](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-hotkeys-md).

Lit currently ships the hotkeys adapter only, so no dedicated Lit devtools package is required.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

preact: @tanstack/preact-devtools
preact: @tanstack/preact-hotkeys-devtools
react: @tanstack/react-devtools
react: @tanstack/react-hotkeys-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-hotkeys-devtools
vue: @tanstack/vue-hotkeys-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

## React

See the [devtools](./foundations.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

## Preact

See the [devtools](./foundations.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

## Solid

See the [devtools](./foundations.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

## Vue

See the [devtools](./foundations.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<a id="source-hotkeys-docs-overview-md"></a>

## Overview

Source: `hotkeys:docs/overview.md`.

TanStack Hotkeys is a **type-safe**, **framework-agnostic** library for handling keyboard shortcuts in your applications. It provides a comprehensive set of utilities for registering hotkeys, tracking key state, recording custom keyboard shortcuts, and handling multi-key sequences -- all with first-class TypeScript support and cross-platform compatibility.

> [!IMPORTANT]
> TanStack Hotkeys is currently in **alpha** and its API is still subject to change. Early adopters are encouraged to help us solve edge cases across multiple keyboard layouts, locales, and operating systems.

### Motivation

On the surface, keyboard shortcuts are a simple concept, and you would think that it should just take a couple of lines of code to implement them. And sometimes, it can be that simple. However, there are enough small "gotchas" that can eventually add up to an annoying amount of complexity when you need to consider multiple keyboard layouts, operating systems, custom shortcuts, conflicting hotkey scopes, properly ignoring input elements, and more.

Surprisingly, in our experience, even AI often struggles to get hotkey management fully correct. We believe that providing a library that brings type-safety and well thought out cross-platform compatibility to hotkey management is a valuable contribution to the community.

### Features

- **Desired Defaults**
  - TanStack Hotkeys automatically uses `preventDefault`, `stopPropagation`, and intelligently ignores hotkeys when input elements are focused by default.

- **Type-Safe Hotkey Strings**
  - Full autocomplete for valid modifier - e.g. `Control+A`, `Alt+S`, `Shift+D`, `Mod+Shift+G`, etc.
  - Alternatively, you can use a raw `RawHotkey` object to register hotkeys: `useHotkey({ key: 'S', mod: true }, handler)`

- **Cross-Platform Compatibility**
  - `Mod` resolves to `Meta` (Cmd) on macOS and `Control` on Windows/Linux

- **event.key API**
  - The primary APIs are built around the `event.key` property, which is the most reliable way to determine the key that was pressed.
  - `event.code` is used as a fallback for letter keys (A-Z) and digit keys (0-9) when `event.key` produces special characters (e.g., macOS Option+letter or Shift+number).

- **Hotkey Registration**
  - Centralized `HotkeyManager` with per-target listeners, conflict detection, and automatic input filtering

- **Multi-Key Sequences**
  - Vim-style sequences (e.g., `['G', 'G']`, `['D', 'I', 'W']`) with configurable timeout

- **Hotkey Recording**
  - Interactive capture for settings UIs with portable `Mod` format conversion

- **Key State Tracking**
  - Real-time held keys hooks: `useHeldKeys`, `useHeldKeyCodes`, `useKeyHold`

- **Display Formatting**
  - Platform-aware formatting (e.g., `⌘⇧S` on Mac vs `Ctrl+Shift+S` on Windows) for cheatsheet UIs

- **Framework Adapters**
  - React and Preact hooks, Solid primitives, Angular inject APIs, Vue composables, and Lit controllers/decorators

- **Awesome Devtools!**
  - See all currently registered hotkeys, held keys, and more in real-time.

For a complete walkthrough, see the [React Quick Start](./framework-react.md#source-hotkeys-docs-framework-react-quick-start-md), [Angular Quick Start](./framework-angular.md#source-hotkeys-docs-framework-angular-quick-start-md), [Vue Quick Start](./framework-vue.md#source-hotkeys-docs-framework-vue-quick-start-md) or [Lit Quick Start](./framework-lit.md#source-hotkeys-docs-framework-lit-quick-start-md).
