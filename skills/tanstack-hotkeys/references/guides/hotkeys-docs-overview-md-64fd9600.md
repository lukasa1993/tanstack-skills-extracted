# Overview

<a id="source-hotkeys-docs-overview-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys is a type-safe, framework-agnostic library for keyboard shortcuts. It includes:

- **Hotkey registration** for shortcuts like `Mod+S` and Vim-style sequences like `G G`
- **Display formatting** for platform-appropriate labels like `⌘ S` and `Ctrl+S`
- **Scopes** for turning groups of hotkeys on and off with the part of the page they belong to
- **App hotkeys** for cheat sheets and user-customizable shortcuts
- **Hotkey recording** for shortcut settings screens
- **Key state tracking** for held keys and modifier hints
- **Devtools** for inspecting shortcuts while you develop

> [!IMPORTANT]
> TanStack Hotkeys is currently in **beta** and its API is still subject to change. Early adopters are encouraged to help us solve edge cases across multiple keyboard layouts, locales, and operating systems.

## Motivation

On the surface, keyboard shortcuts are a simple concept, and you would think that it should just take a couple of lines of code to implement them. And sometimes, it can be that simple. However, there are enough small "gotchas" that can eventually add up to an annoying amount of complexity when you need to consider multiple keyboard layouts, operating systems, custom shortcuts, conflicting hotkey scopes, properly ignoring input elements, and more. Browser keyboard events have their own edge cases too: key repeat, IME composition, and keys that look stuck after a missed key-up or a window switch.

As an app grows, its shortcuts also end up scattered across components. Cheat sheets and settings screens are maintained by hand, drift out of sync with the actual hotkeys, and miss shortcuts on pages that haven't loaded yet.

Surprisingly, in our experience, even AI often struggles to get hotkey management fully correct. We believe that providing a library that brings type-safety and well thought out cross-platform compatibility to hotkey management is a valuable contribution to the community.

## Features

### Hotkey registration

Register shortcuts such as `Mod+S` to save a document or `Escape` to close a dialog. A hotkey registered by a component is active while that component is mounted, so a dialog's `Escape` works only while the dialog is open. Hotkeys can also be enabled conditionally or bound to a specific element. `HotkeyManager` handles event listeners, conflict detection, and input filtering.

By default, TanStack Hotkeys prevents the browser's default action, stops event propagation, and ignores single-key shortcuts while the user types in a text field. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains each default and how to change it.

### Multi-key sequences

Some shortcuts are a series of keystrokes instead of a single combination. Pass an array of chords anywhere a hotkey is accepted to register a Vim-style sequence such as `['G', 'G']` or `['D', 'I', 'W']`, with a configurable timeout between steps. Use sequences for navigation or commands when you want more shortcuts without adding more modifier keys.

### Type-safe, cross-platform bindings

TypeScript autocomplete helps you write valid shortcut strings such as `Control+A`, `Alt+S`, or `Mod+Shift+G`. You can also use a `RawHotkeyChord` object, such as `{ key: 'S', mod: true }`.

`Mod` resolves to Command on macOS and Control on Windows and Linux, so the same binding works across operating systems. Logical shortcuts follow the character that was pressed, while physical shortcuts follow a keyboard position. This lets you choose between a letter-based command and a position-based control, such as movement in a game.

### Display formatting

Format chords and sequences for menus, buttons, and cheat sheets with platform-appropriate labels, such as `⌘ S` on macOS and `Ctrl+S` on Windows. You can display a shortcut as text or individual keycaps while keeping its stored hotkey separate from its label.

### Scopes

Larger apps reuse keys. `Escape` should close the dialog, not the panel behind it. Give part of your app a scope, and its hotkeys turn on and off with that part of the page. Nested scopes take precedence over the scopes around them, and an exclusive scope, such as a dialog's, suspends every other scope while it is open.

### App hotkeys

Hotkeys registered by components only exist while those components are mounted. Declare every hotkey up front with `defineAppHotkeys` and pass the declarations to your framework's provider to list them in cheat sheets and settings screens, even on routes that have not loaded. Users can rebind or unbind any of them, conflicts are checked across every declaration, and your app decides where to save their custom hotkeys.

### Hotkey recording

`HotkeyRecorder` captures a key combination so users can customize shortcuts in a settings UI. Set `maxSteps: Infinity` to let users record a sequence too. It supports validation and conflict checks before you save a hotkey. You can register the recorded hotkey directly, store it in your application's state, or save it as an app hotkey's custom hotkey.

### Key state tracking

`KeyStateTracker` tracks held keys and modifiers. Framework APIs such as `useHeldKeys`, `useHeldKeyCodes`, and `useKeyHold` let you respond while a key is down. Use them for keyboard controls, visual feedback, or hints that appear while a modifier is held.

### Framework adapters

Use React and Preact hooks, Solid primitives, Angular inject APIs, Vue composables, Lit controllers and decorators, Svelte reactive APIs, Alpine scopes, Ember helpers, or Octane hooks. The adapters connect hotkey registration and key state to your framework and clean up registrations when components unmount. You can also use the core utilities directly in vanilla JavaScript.

### Devtools

See registered hotkeys, scopes, declared app hotkeys, held keys, and sequence progress in real time. The [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) help you inspect which shortcuts are active and how they are configured while developing your application.

## Where to start

Most apps only need to register hotkeys and show them in the UI. Start with the quick start for [React](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#source-hotkeys-docs-framework-react-quick-start-md), [Preact](./hotkeys-docs-framework-preact-quick-start-md-9cac7afa.md#source-hotkeys-docs-framework-preact-quick-start-md), [Solid](./hotkeys-docs-framework-solid-quick-start-md-cfbf152e.md#source-hotkeys-docs-framework-solid-quick-start-md), [Angular](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#source-hotkeys-docs-framework-angular-quick-start-md), [Vue](./hotkeys-docs-framework-vue-quick-start-md-468563f0.md#source-hotkeys-docs-framework-vue-quick-start-md), [Svelte](./hotkeys-docs-framework-svelte-quick-start-md-6ea8096f.md#source-hotkeys-docs-framework-svelte-quick-start-md), [Lit](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md), [Alpine](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md), [Ember](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md), or [Octane](./hotkeys-docs-framework-octane-quick-start-md-ecf7a027.md#source-hotkeys-docs-framework-octane-quick-start-md).

Add the other pieces when your app needs them:

- **Scopes**, when groups of hotkeys turn on and off together, such as everything in a dialog or a pane.
- **App hotkeys**, when you want a cheat sheet that lists every shortcut, or want users to change them.
- **Recording**, when users should be able to press the shortcut they want in a settings screen.
