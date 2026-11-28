# Sensible Defaults — Recording captures what the user pressed

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Recording captures what the user pressed

With the default `recordBy: 'auto'`, the hotkey recorder writes what the user typed, just as you would by hand. Command+S on macOS and Control+S elsewhere both record `'Mod+S'`.

- **Typed characters.** A symbol typed with `Shift` records without `Shift`, the way the matcher reads it: `Shift+/` records `?`, `Shift+1` records `!`, AZERTY `Shift+&` records `1`, and German `Shift+3` records `§`. With `Control` or `Command`, `Ctrl+Shift+/` and macOS `Cmd+Shift+/` both record `Mod+?`. On macOS, `Command` may report the unshifted character, so `Cmd+Shift+symbol` keeps `Shift` except on the key's US position: Dvorak `Cmd+Shift+/` records `Mod+Shift+/`, and `Cmd+Shift+,` records `Mod+Shift+,`. A character typed with `AltGr` records as itself (German `AltGr+Q` records `@`). Numpad `Enter` records `Enter`, and the numpad operators without `Shift` record their character (`Ctrl+numpad +` records `Mod++`).
- **The digit row with modifiers.** With `Control`, `Command` or `Alt`, a digit-row key records its digit, as the matcher reads it: AZERTY `Ctrl+&` records `Mod+1`, and `Ctrl+Shift+1` records `Mod+Shift+1` on every platform, though Windows reports `!` and macOS reports `1`. `Control` or `Command` alone with `-`, `+` or `=` keeps the character for zoom (AZERTY `Ctrl+-` records `Mod+-`).
- **Fallback to physical codes.** When a typed character changes with the platform or layout, the recorder falls back to bracketed physical codes: macOS `Option` with a symbol (`Option+/` becomes `Alt+[Slash]`), dead keys (except `Option+letter` accents like `Alt+E`), numpad digits and the decimal key (what they type depends on NumLock and the layout), and `Shift` with a numpad operator. Non-Latin letter presses record as their US position (`Control+ы` becomes `Mod+S`), so they keep working after a switch to an English layout.
- **Explicit modes.** Set `recordBy: 'code'` to always record physical positions (for games), or `recordBy: 'key'` to always record typed characters (`Option+S` becomes `Alt+ß`).
- **Conflict detection.** Enable `detectConflicts` (or pass `context` to `findConflicts`) to catch collisions even when a recording and a declared hotkey are spelled differently, such as `Shift+[Slash]` recorded by code, or saved by an earlier version, and a declared `?`.

While recording is active:

- `Escape`, `Tab`, and `Shift+Tab` cancel so keyboard users aren't trapped (`recordTab: true` records Tab instead).
- The window losing focus cancels and calls `onCancel`: switching apps or tabs, opening browser devtools, clicking into an iframe, or an OS shortcut such as Spotlight. Keys pressed elsewhere never reach the page, so a recording left running would take the first key pressed after coming back (`cancelOnBlur: false` keeps recording). A click elsewhere on the page doesn't cancel.
- `Backspace` or `Delete` undoes the last sequence step, or clears when empty.
- `Enter` commits multi-step sequences (`maxSteps: Infinity`).
- Existing registered hotkeys pause automatically, while typing in other inputs passes through.
- To show the modifiers held so far, join the held modifier keys from the key state tracker with `+` and pass them to `formatForDisplay`. Leave other keys out, because a string that starts with a non-modifier key formats as empty. It orders them as in a chord: `⌃ ⌥ ⇧ ⌘` on macOS, `Ctrl+Alt+Shift+Win` elsewhere.
- `AltGr` presses record the character they typed. `recordBy: 'code'` rejects them, and every mode rejects `AltGr` that typed nothing new, except on Windows, where the recorder treats `AltGr` with a key it doesn't change, such as `Home` or `F`, as a Control+Alt shortcut: `AltGr+Home` records `Mod+Alt+Home`, or `Mod+Alt+[Home]` with `recordBy: 'code'`.
- Shortcuts that the browser or the operating system keeps never reach the page, so the recorder can't record them and shows no error: `Mod+T`, `Mod+N`, and `Mod+W` in Chrome, `Command+Tab` and `Command+Space` on macOS, and most `Win` shortcuts on Windows. Tell users which keys they can't use, next to the recorder.
