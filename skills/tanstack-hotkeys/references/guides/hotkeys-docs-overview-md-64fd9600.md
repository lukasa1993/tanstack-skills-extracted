# Overview

<a id="source-hotkeys-docs-overview-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.8.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys is a **type-safe**, **framework-agnostic** library for handling keyboard shortcuts in your applications. It provides a comprehensive set of utilities for registering hotkeys, tracking key state, recording custom keyboard shortcuts, and handling multi-key sequences -- all with first-class TypeScript support and cross-platform compatibility.

> [!IMPORTANT]
> TanStack Hotkeys is currently in **alpha** and its API is still subject to change. Early adopters are encouraged to help us solve edge cases across multiple keyboard layouts, locales, and operating systems.

## Motivation

On the surface, keyboard shortcuts are a simple concept, and you would think that it should just take a couple of lines of code to implement them. And sometimes, it can be that simple. However, there are enough small "gotchas" that can eventually add up to an annoying amount of complexity when you need to consider multiple keyboard layouts, operating systems, custom shortcuts, conflicting hotkey scopes, properly ignoring input elements, and more.

Surprisingly, in our experience, even AI often struggles to get hotkey management fully correct. We believe that providing a library that brings type-safety and well thought out cross-platform compatibility to hotkey management is a valuable contribution to the community.

## Features

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

For a complete walkthrough, see the [React Quick Start](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#source-hotkeys-docs-framework-react-quick-start-md), [Angular Quick Start](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#source-hotkeys-docs-framework-angular-quick-start-md), [Vue Quick Start](./hotkeys-docs-framework-vue-quick-start-md-468563f0.md#source-hotkeys-docs-framework-vue-quick-start-md) or [Lit Quick Start](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md).
