# Sensible Defaults — Hotkeys run after the page's own handlers

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Hotkeys run after the page's own handlers

Hotkeys listen during the bubble phase, so a focused widget's own keyboard handler runs first. If a tab strip, editor, or menu handles a key and stops propagation, your hotkey never sees it. Usually that is what users expect: the widget they are working in should win.

Set `capture: true` when an app-level shortcut has to win anyway. It works with both `keydown` and `keyup` hotkeys. For example, a tab strip that ignores modifiers might treat `Mod+Backspace` as Backspace and close a tab before a document-level "close view" hotkey runs. With `capture: true`, the hotkey runs first, and the default `stopPropagation: true` keeps the key from the tab strip. Set `stopPropagation: false` if the widget should still receive it.

Capture doesn't change which keys a hotkey skips. Typing in inputs and keys that focused controls keep for themselves are still skipped while `ignoreInputs` is on.
