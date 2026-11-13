# Sensible Defaults — Recording captures what the user pressed

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Recording captures what the user pressed

The hotkey recorder writes a hotkey the way you would write it by hand (`recordBy: 'auto'`). Command+S on macOS, or Control+S on Windows and Linux, records `Mod+S`. On a French AZERTY keyboard, the same modifier with the key labeled A records `Mod+A`, so the label shows the keycap, and the hotkey equals a `Mod+A` in your code.

Some presses have no name that means the same thing everywhere. The recorder records those by position, in brackets:

- **Shift with a digit or a symbol.** Shift+/ records `Shift+[Slash]`, and Shift+1 records `Shift+[Digit1]`. For Control+Shift+/, Windows reports `?`, and for Command+Shift+/, macOS reports `/`, so a recorded `?` would not fire on a Mac. Shift with a letter or a named key records it by name, such as `Shift+A` and `Shift+Enter`.
- **Option on macOS with a digit or a symbol.** Option+1 types `¡` and records `Alt+[Digit1]`. Option with a letter records the letter on the keycap: Option+S records `Alt+S`, not `ß`. Option with a named key records it by name, such as `Alt+Enter`.
- **Dead keys**, which type nothing until the next key. Option with a letter that starts an accent is the exception: Option+E on a US Mac records `Alt+E`.
- **The numpad**, where one key types `1` or End depending on NumLock.

A letter from a non-Latin layout records as the key in its position on a US keyboard, the way it [matches](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#keys-match-the-character-the-user-types). On Windows with a Russian layout, Control+ы records `Mod+S`, and Control+х records `Mod+[`.

Set `recordBy: 'code'` to record every key by position, such as for game controls. Set `recordBy: 'key'` to record the character every press types, which records `Alt+ß` for Option+S and `Shift+?` for Shift+/.

A recorded hotkey and one written by hand can differ and still fire for the same key press. On a US keyboard, a recorded `Shift+[Slash]` and a declared `?` are one press. The recorder's `detectConflicts` option checks with the key presses that made the recording. For app hotkeys, pass the recorder's `context` to `findConflicts`, which does the same.

While recording:

- **Escape** cancels.
- **Tab** and **Shift+Tab** cancel and move focus, so keyboard users can leave the recorder. Set `recordTab: true` to record them instead, and tell users that Escape cancels.
- **Backspace** or **Delete** removes the last step, or clears an empty recording.
- **Enter** commits a sequence recording, made with `maxSteps: Infinity`.
- **Registered hotkeys are paused**, so pressing `Mod+S` to record it does not also save.
- **Typing in inputs passes through**, so other fields on the page keep working. Escape still cancels.
- **AltGr is rejected** unless you set `recordBy: 'key'`, because it types characters rather than shortcuts. The exception is AltGr with a key it does not change on Windows, such as AltGr+Home, which records as Control+Alt. Character recordings (`recordBy: 'key'`) accept the characters AltGr types, but on Linux they reject AltGr with a key it does not change, because that press fires no hotkey.
