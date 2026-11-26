# Sensible Defaults — Recording captures what the user pressed

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Recording captures what the user pressed

With the default `recordBy: 'auto'`, the hotkey recorder writes portable strings just as you would by hand. Command+S on macOS and Control+S elsewhere both record `'Mod+S'`.

- **Fallback to physical codes.** When presses aren't portable across layouts or operating systems, the recorder falls back to bracketed physical codes: `Shift+/` becomes `Shift+[Slash]`, `Shift+1` becomes `Shift+[Digit1]`, macOS `Option+1` becomes `Alt+[Digit1]`, plus dead keys (except `Option+letter` accents like `Alt+E`) and numpad keys. Non-Latin letter presses record as their US position (`Control+ы` becomes `Mod+S`).
- **Explicit modes.** Set `recordBy: 'code'` to always record physical positions (for games), or `recordBy: 'key'` to always record typed characters (`Option+S` becomes `Alt+ß`).
- **Conflict detection.** Enable `detectConflicts` (or pass `context` to `findConflicts`) to catch collisions even when a recording (`Shift+[Slash]`) and a declared hotkey (`?`) are spelled differently.

While recording is active:

- `Escape`, `Tab`, and `Shift+Tab` cancel so keyboard users aren't trapped (`recordTab: true` records Tab instead).
- `Backspace` or `Delete` undoes the last sequence step, or clears when empty.
- `Enter` commits multi-step sequences (`maxSteps: Infinity`).
- Existing registered hotkeys pause automatically, while typing in other inputs passes through.
- To show the modifiers held so far, join the held modifier keys from the key state tracker with `+` and pass them to `formatForDisplay`. Leave other keys out, because a string that starts with a non-modifier key formats as empty. It orders them as in a chord: `⌃ ⌥ ⇧ ⌘` on macOS, `Ctrl+Alt+Shift+Win` elsewhere.
- `AltGr` presses are rejected unless `recordBy: 'key'`, except `AltGr+Home` on Windows which records as `Control+Alt+Home`.
