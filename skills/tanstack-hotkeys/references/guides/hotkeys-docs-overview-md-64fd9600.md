# Overview

<a id="source-hotkeys-docs-overview-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys is a type-safe, headless library for keyboard shortcuts, sequences, recording, and key state tracking. Use its framework adapters for registration and cleanup, and build shortcut interfaces with your own components and application state.

## Runtime and package requirements

Hotkeys packages ship ES2022 JavaScript as ESM only and require Node.js 20 or newer when used in Node.js. Browser applications need an ES2022-compatible runtime or a build pipeline that transforms the library for their supported browsers.

Use ESM imports, such as `import { parseHotkey } from '@tanstack/hotkeys'`. CommonJS builds and `require` export conditions are no longer provided. CommonJS applications can use dynamic `import()` or migrate their consuming modules to ESM.

Published packages contain the runtime files and TypeScript declarations in `dist`, plus package metadata, README, and license files. The repository's `src` directory and source maps are no longer included. Inspect `dist/index.d.ts` and its referenced declarations for the installed API; consult the matching repository version when you need the original implementation.

## Choose what a shortcut follows

A binding can follow a logical character or a physical keyboard position. Both forms use the same registration APIs:

```ts
// React; the other adapters accept the same binding forms.
useHotkey('Mod+S', save) // Logical S on the active layout
useHotkey('Alt+[KeyW]', moveForward) // Physical KeyW position
useHotkey({ code: 'NumpadAdd', mod: true }, zoomIn)
```

`Mod` means Command on macOS and Control on Windows/Linux. Brackets identify physical `event.code` names in strings, including `[Enter]` and `[F13]`. Object bindings use either `key` or `code`, never both. Both logical names and physical codes have type-safe autocomplete.

Logical bindings prefer `event.key`. ASCII letter output remains authoritative on layouts such as Dvorak and AZERTY; conservative code fallback helps when Option, dead keys, or non-Latin output transforms the character. Physical bindings match `event.code` exactly. Among eligible registrations on a target, exact matches take priority over weaker fallbacks.

Logical and physical bindings both support F1–F24 and shared named keys such as `CapsLock`, `MediaPlayPause`, and `BrowserBack`. Some browser names differ: logical `LaunchApplication1` corresponds to physical `[LaunchApp1]`. Logical `Enter` includes numpad Enter, while `[Enter]` and `[NumpadEnter]` distinguish their positions.

## Register actions and sequences

Single shortcuts and sequence steps use the same binding syntax. For example, `['G', 'G']` follows the logical letter, while `['[KeyG]', '[KeyG]']` follows a position. Sequences may mix logical and physical steps. Modifier-only events, IME composition, and automatic repeats do not advance sequences or extend their timeout.

Registrations support enabled state, element targets, input handling, callback metadata, and conflict policies. Framework adapters update bindings from normal reactive state and remove them on unmount. `meta.name`, `meta.description`, and `meta.group` describe registrations for menus and help panels; they do not change matching or scope.

## Record a replacement binding

Recorders default to `recordBy: 'code'`. On macOS, Option+S producing `ß` records `Alt+[KeyS]`, so replay follows the same physical combination. Set `recordBy: 'key'` to intentionally record the produced logical character. The recorder never silently switches between these modes.

Pass recorded strings directly into registrations and store them in ordinary application state. Both single and sequence recorders support validation, structured rejection, and live-registry conflict checks. Rejected candidates leave recording active. Clearing calls only `onClear`; your app decides whether that removes a binding or restores an initial value.

## Display shortcuts and hints

Use `formatForDisplay` at render time. Both `Mod+S` and `Mod+[KeyS]` display as `⌘ S` on macOS, but their stored identities remain distinct. `parts: true` returns individual keycap labels, and symbols can be configured separately for modifiers and keys.

Physical labels use readable defaults such as `S`, `2`, and numpad labels. For a known layout, pass an already-resolved `layoutMap`; use `keyLabels` for explicit overrides. Formatting stays synchronous and never loads a keyboard layout. Labels do not change registration or recording behavior.

Key-state primitives expose held logical keys and physical codes. `matchesHeldModifiers` and framework hint helpers reveal relevant shortcuts while modifiers are held. Live registration views and devtools expose current shortcuts and sequence progress, making it possible to build grouped help panels without a separate action catalog.

## Inspect a binding

`ParsedHotkey` preserves identity as a union: logical bindings have `key`, physical bindings have `code`. Narrow with `parsed.code !== undefined` before reading it. Shared resolved flags and the ordered modifier list live in `ParsedModifiers`. `parseKeyboardEvent` produces logical identity; code recording constructs physical identity explicitly.

Start with the [React Quick Start](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#source-hotkeys-docs-framework-react-quick-start-md), [Angular Quick Start](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#source-hotkeys-docs-framework-angular-quick-start-md), [Vue Quick Start](./hotkeys-docs-framework-vue-quick-start-md-468563f0.md#source-hotkeys-docs-framework-vue-quick-start-md), or [Lit Quick Start](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md). Explore the [Router kitchen sink](https://github.com/TanStack/hotkeys/blob/e06d82da83733a874e28c4144ad13e129e462491/examples/react/kitchen-sink/README.md) for route lifetimes, recording, and hints, or the [vanilla formatter playground](https://github.com/TanStack/hotkeys/tree/e06d82da83733a874e28c4144ad13e129e462491/examples/vanilla/formatForDisplay) for display options.
