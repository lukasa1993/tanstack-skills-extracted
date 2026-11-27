# Sensible Defaults — Modifiers must match exactly

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Modifiers must match exactly

`Mod+S` won't fire on `Mod+Shift+S`, and `K` won't fire on `Shift+K`. Exact matching keeps `Mod+Z` (undo) and `Mod+Shift+Z` (redo) from colliding.

- **Symbols typed with `Shift`.** Printable symbols like `?`, typed with `Shift+/` on US keyboards, match without listing `Shift+`. Letters always require explicit `Shift+` (`K` versus `Shift+K`).
- **iOS auto-capitalization.** The iOS on-screen keyboard sometimes reports Return as `Shift+Enter` at the start of a sentence. If an `Enter` shortcut must work inside an editor (`ignoreInputs: false`), register `Shift+Enter` for it too.
- **Modifier-only hotkeys are rejected.** Every hotkey needs a non-modifier key. TypeScript rejects strings like `Shift+Alt+Mod` or `Ctl+K`. Plain JS or saved strings log a dev warning and register nothing. Use the held-key APIs to react to modifiers alone.
- **AltGr is treated as character input.** On Windows and Linux, `AltGr` types characters like `@` or `€`. Those match character bindings, never `Control+Alt` shortcuts, so typing an email doesn't trigger commands. On Windows, Left Ctrl + Left Alt acts as `AltGr` on layouts that have it, so avoid `Control+Alt` with letters, digits, and symbols when users type in other languages (German `Ctrl+Alt+E` types `€` and Polish `Ctrl+Alt+A` types `ą` instead of triggering `Control+Alt+E` or `Control+Alt+A`). When `AltGr+key` produces no new character (such as `AltGr+F`), it doesn't fire `F`. Because Windows reports `AltGr` as Control+Alt, `AltGr+Home` triggers `Control+Alt+Home` on Windows, matching native apps.
- **IME composition pauses hotkeys.** While users compose text with an IME (Japanese, Chinese, Korean), all hotkeys pause. This includes the `Enter` Safari emits right after composition ends, so `Enter`, `Escape`, and arrow keys belong to the IME.
