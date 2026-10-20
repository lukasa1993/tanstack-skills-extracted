# Sensible Defaults — Modifiers must match exactly

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Modifiers must match exactly

`Mod+S` does not fire for `Mod+Shift+S`, and `K` does not fire for `Shift+K`. Exact matching lets `Mod+Z` (undo) and `Mod+Shift+Z` (redo) coexist without one swallowing the other.

The exception is Shift that is needed to type a symbol. On a US layout, `?` is typed with Shift+/, so `?` matches without listing `Shift`. This applies to printable symbols, not letters, so `K` and `Shift+K` remain different bindings.

Two kinds of key events never match ordinary shortcuts:

- **AltGr.** On Windows and Linux, AltGr types characters such as `@` and `€` on many layouts. A character it types matches a binding for that character, but never a `Control+Alt` shortcut, so typing an email address does not run a command. When AltGr+key types nothing new, such as AltGr+Home, or AltGr+F on a layout with nothing on that key, it does not fire `Home` or `F`. Windows reports AltGr as Control+Alt, so there it fires `Control+Alt` shortcuts instead: AltGr+Home triggers `Control+Alt+Home`, as in native Windows apps.
- **IME composition.** While the user composes text with an input method editor, such as for Japanese, Chinese, or Korean, character and physical bindings do not fire. Named keys such as `Escape` still do.
