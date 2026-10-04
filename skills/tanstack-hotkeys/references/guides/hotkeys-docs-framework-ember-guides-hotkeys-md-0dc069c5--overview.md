# Hotkeys — Overview

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

`useHotkey` registers a shortcut with the shared `HotkeyManager`. `useHotkey`, `useHotkeys`, `useHotkeySequence`, and `useHotkeySequences` are template helpers. Invoke them with `{{...}}`, not as JavaScript hooks. Tracked arguments update registrations after rendering. Removing a helper from the template unregisters its bindings.

State readers and recorders are JavaScript functions. Pass the containing component as their first argument, usually `this`. The adapter releases subscriptions and recorders when that owner is destroyed. State readers expose `.value`; recorder fields and registration arrays are reactive getters. Read those properties in templates or getters instead of destructuring an initial snapshot.
