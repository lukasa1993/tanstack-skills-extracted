# Sensible Defaults — Modifiers must match exactly

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Modifiers must match exactly

`Mod+S` does not fire for `Mod+Shift+S`, and `K` does not fire for `Shift+K`. Exact matching lets `Mod+Z` (undo) and `Mod+Shift+Z` (redo) coexist without one swallowing the other.

The exception is Shift that is needed to type a symbol. On a US layout, `?` is typed with Shift+/, so `?` matches without listing `Shift`. This applies to printable symbols, not letters, so `K` and `Shift+K` remain different bindings.

Two kinds of key events never match ordinary shortcuts:

- **AltGr.** On Windows and Linux, AltGr types characters such as `@` and `€` on many layouts and reports itself as Control+Alt. Those key presses do not trigger `Control+Alt` shortcuts, so typing an email address does not run a command.
- **IME composition.** While the user composes text with an input method editor, such as for Japanese, Chinese, or Korean, character and physical bindings do not fire. Named keys such as `Escape` still do.
