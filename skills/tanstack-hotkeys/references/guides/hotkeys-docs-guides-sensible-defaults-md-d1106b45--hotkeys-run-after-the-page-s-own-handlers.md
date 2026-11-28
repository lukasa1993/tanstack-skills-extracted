# Sensible Defaults — Hotkeys run after the page's own handlers

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Hotkeys run after the page's own handlers

Hotkeys listen in the bubble phase by default, so a focused widget's own `onKeyDown` handler runs first and can call `stopPropagation()`.

- **Delegated event frameworks (React, Svelte, Solid, Octane).** Because those frameworks delegate `onKeyDown` at the root or document, a hotkey with an element `target` waits until after delegated handlers on the page run too. That means `stopPropagation()` on an element hotkey won't stop an outer framework `onKeyDown`. In other frameworks, handlers outside the target run after the hotkey.
- **Override widgets with `capture: true`.** When an app-level shortcut must run before a widget (such as `Mod+Backspace` closing a view before a tab strip treats it as Backspace), set `capture: true`. It works for both `keydown` and `keyup` and still respects `ignoreInputs`.
