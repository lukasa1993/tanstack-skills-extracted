# Sensible Defaults — Single-key shortcuts need an off switch

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Single-key shortcuts need an off switch

Ignoring text inputs prevents `K` from firing while typing, but speech-input users dictate words as single keystrokes. Under [WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html), any shortcut using only letters, numbers, or symbols (including `Shift+K` or a sequence like `['G', 'G']`) must satisfy at least one of these conditions:

- **Turn it off.** Wire `enabled` to a user preference.
- **Remap it.** Let users add a modifier through app hotkeys and the recorder.
- **Scope it to focus.** Give it an element `target` so it fires only while that widget is focused.

Shortcuts using `Mod`, `Control`, or `Alt`, as well as non-character keys like `Escape`, function keys, and media keys, don't need this.
