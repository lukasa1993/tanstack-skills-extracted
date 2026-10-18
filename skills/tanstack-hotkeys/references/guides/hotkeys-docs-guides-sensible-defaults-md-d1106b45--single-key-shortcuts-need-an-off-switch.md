# Sensible Defaults — Single-key shortcuts need an off switch

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Single-key shortcuts need an off switch

Ignoring inputs keeps a `K` hotkey from firing while the user types in a field, but it does not cover every case. Speech input users dictate words that arrive as key presses, and a stray key press can run a command. [WCAG 2.1.4](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html) requires that a shortcut made of a single letter, number, punctuation, or symbol key meets at least one of these conditions:

- **Users can turn it off.** Pass `enabled` from a user setting.
- **Users can remap it** to include a modifier such as Control. App hotkeys let users rebind or unbind any hotkey you declare.
- **It only works while a component has focus.** Set `target` to that component's element.

Shortcuts with `Mod`, Control, or Alt, and keys that don't type characters, such as `Escape` and the function keys, are not affected. Shift doesn't count as a modifier here, because `Shift+K` still types a letter.
