# Overview

<a id="source-hotkeys-docs-overview-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys is a type-safe, framework-agnostic keyboard shortcut library. It includes:

- **Hotkey registration** for single shortcuts (`Mod+S`) and Vim-style sequences (`G G`)
- **Platform display formatting** (`⌘ S` on macOS, `Ctrl+S` on Windows and Linux)
- **Scopes** to turn groups of shortcuts on and off with dialogs, panels, and tabs
- **App hotkeys** for centralized shortcut registries, cheat sheets, and user rebinding
- **Hotkey recording** for customizable shortcut settings screens
- **Key state tracking** for held keys and modifier-reveal hints
- **Devtools** to inspect registrations, scopes, and sequence progress live

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkey('Mod+S', () => saveDocument())
  return <textarea />
}
```

> [!IMPORTANT]
> TanStack Hotkeys is currently in **beta** and its API may still change. Early adopters are encouraged to report edge cases across keyboard layouts, locales, and operating systems.

## Motivation

On the surface, keyboard shortcuts look like a two-line `keydown` listener. For one shortcut, they can be. Then real-world edge cases show up: cross-platform `Cmd` versus `Ctrl`, non-US keyboard layouts, ignoring inputs without breaking `Mod+S` or `Escape`, key auto-repeat, IME composition, overlapping scopes, and keys getting stuck when the user switches windows.

As an app grows, shortcuts also end up scattered across components. Cheat sheets and settings screens are maintained by hand, drift out of sync with actual handlers, and miss shortcuts on routes that haven't mounted yet.

Even AI coding tools frequently miss these details and fall back to fragile `keydown` checks. TanStack Hotkeys solves them once with type-safe bindings, sensible defaults, and framework adapters that clean up automatically.

## Where to start

Most apps only need to register shortcuts and render their labels. Jump straight to the Quick Start for your framework:

- [React](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#source-hotkeys-docs-framework-react-quick-start-md) · [Preact](./hotkeys-docs-framework-preact-quick-start-md-9cac7afa.md#source-hotkeys-docs-framework-preact-quick-start-md) · [Solid](./hotkeys-docs-framework-solid-quick-start-md-cfbf152e.md#source-hotkeys-docs-framework-solid-quick-start-md) · [Angular](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#source-hotkeys-docs-framework-angular-quick-start-md) · [Vue](./hotkeys-docs-framework-vue-quick-start-md-468563f0.md#source-hotkeys-docs-framework-vue-quick-start-md)
- [Svelte](./hotkeys-docs-framework-svelte-quick-start-md-6ea8096f.md#source-hotkeys-docs-framework-svelte-quick-start-md) · [Lit](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md) · [Alpine](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md) · [Ember](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md) · [Octane](./hotkeys-docs-framework-octane-quick-start-md-ecf7a027.md#source-hotkeys-docs-framework-octane-quick-start-md)

If you use vanilla JavaScript, install `@tanstack/hotkeys` directly. See [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md).

Once the basics are in place, add extra features when your app needs them:

- **Scopes** for groups of shortcuts that turn on and off together, such as modals, drawers, or tabs
- **App hotkeys** for an app-wide cheat sheet or user-customizable bindings
- **Recording** for settings screens where users press keys to rebind shortcuts

## Features

### Hotkey registration

Register chords like `Mod+S` or `Escape` inside the components that own them. Hotkeys activate when a component mounts and clean up when it unmounts. Hotkeys also support conditional `enabled` flags and element-specific `target` options.

By default, matched hotkeys prevent the browser's default action, stop propagation, and skip single-key shortcuts while typing in text fields. See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for every default and how to change it.

### Multi-key sequences

Pass an array of chords anywhere a hotkey is accepted to create Vim-style or multi-step commands like `['G', 'G']` or `['Mod+K', 'Mod+C']`, with a configurable timeout between steps.

### Type-safe, cross-platform bindings

Editor autocomplete guides you through valid chord strings like `Control+A`, `Alt+S`, or `Mod+Shift+G`, and TypeScript rejects invalid modifier order or typos at compile time. Bindings also accept dynamic objects like `{ key: 'S', mod: true }`.

`Mod` resolves to Command on macOS and Control on Windows and Linux. Choose logical bindings like `Mod+S` to follow the character on the user's keyboard layout, or physical bindings like `[KeyW]` to follow physical key positions such as WASD game controls.

### Display formatting

Format any chord or sequence for buttons, tooltips, and menus (`⌘ S` on macOS, `Ctrl+S` on Windows and Linux), either as a string or as individual keycaps. Your stored hotkey stays portable while its label adapts to the user's OS and, in supported browsers or with a supplied layout map, to their keyboard layout.

### Scopes

Large apps reuse keys. `Escape` should close the active dialog, not the panel behind it. Wrap parts of your UI in scopes so shortcuts turn on and off with that UI. Nested scopes override outer ones, and `exclusive` scopes suspend everything outside an open modal.

### App hotkeys

Component-level hotkeys only exist while their components are mounted. Declare your app's shortcuts up front with `defineAppHotkeys` so cheat sheets and settings screens know every shortcut, even on unloaded routes. Conflicts are checked across every declaration, and users can rebind or unbind keys with your choice of storage.

### Hotkey recording

Capture user-pressed chords, or multi-step sequences with `maxSteps: Infinity`, for shortcut settings screens. Built-in validation and opt-in conflict detection (`detectConflicts` or `findConflicts`) run before saving.

### Key state tracking

React to keys being held down in real time with `useHeldKeys`, `useHeldKeyCodes`, and `useKeyHold`. Use them for canvas panning modifiers, custom keyboard indicators, or hints that appear while a modifier is held.

### Framework adapters

First-class adapters ship for React, Preact, Solid, Angular, Vue, Svelte, Lit, Alpine, Ember, and Octane, plus the framework-agnostic `@tanstack/hotkeys` core for vanilla JavaScript or non-component code.

### Devtools

Inspect active registrations, scopes, declared app hotkeys, held keys, and live sequence progress in real time with the [TanStack Hotkeys Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md).
