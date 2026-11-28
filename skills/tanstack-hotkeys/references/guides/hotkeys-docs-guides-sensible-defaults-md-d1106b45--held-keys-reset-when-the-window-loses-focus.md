# Sensible Defaults — Held keys reset when the window loses focus

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Held keys reset when the window loses focus

Key state tracking updates on `keydown` and `keyup`, with automatic safeguards against stuck keys:

- **Focus loss and context menus.** Switching apps (`Command+Tab`), hiding the tab, or opening a native context menu clears held keys. A custom menu calling `preventDefault()` on `contextmenu` keeps state.
- **macOS `Command` quirk.** Releasing `Command` on macOS clears other held keys because macOS swallows keyups for keys released while `Command` is held. Other modifiers and platforms keep their keyups.
- **Swallowed modifier keyups.** Shortcuts like macOS screenshot (`Cmd+Shift+4`) steal the modifier `keyup` without blurring the window. Held modifiers resync on the next real user keyboard or mouse event.
