# Sensible Defaults — Keys match the character the user types

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Keys match the character the user types

A logical binding such as `Mod+S` or `?` matches `event.key`, the character the key produces on the active keyboard layout. A user on Dvorak, Colemak, or AZERTY presses the key labeled S to trigger `Mod+S`, wherever that key sits on their keyboard. Matching the key's position (`event.code`) instead would make `Mod+Z` fire on the AZERTY key labeled W, and on Dvorak would turn the key labeled X into a different shortcut.

`event.key` is not always useful, so the matcher falls back to the key's conventional position when the character cannot identify the shortcut:

- **Non-Latin layouts.** On a Russian layout, the S position types `ы`. `Mod+S` still matches there, so shortcuts work without switching layouts.
- **macOS Option.** Option changes the character, so Option+S types `ß`. `Alt+S` still matches. It follows the letter printed on the key: on a French AZERTY Mac, `Alt+A` fires on the key labeled A, which sits in the US Q position. The matcher reads that letter from `event.keyCode`, and falls back to the key's position when `keyCode` names no letter. Option can also type an ASCII symbol on a letter key, such as `@` for German Option+L, and `Alt+L` still matches.
- **Dead keys and the digit row.** A dead key reports `Dead`, and AZERTY's digit row types `&` and `é` for `1` and `2`. The key's position resolves the shortcut, so `Mod+1` works on AZERTY.
- **Symbols typed with Shift.** Shift+1 types `!` on a US layout, and `Shift+1` still matches.

Otherwise, the character the key reports wins, wherever the key sits:

- Outside the digit row, ASCII letters never fall back. ASCII symbols fall back only on the digit row, with Shift, or when macOS Option typed them on a letter key. On AZERTY, the key in the US `/` position types `+`, so Cmd++ zooms the page instead of firing `Mod+/`. On Dvorak, the key that types `'` does not fire `Q`.
- Latin letters such as `ü`, `ö`, and `ø` match only themselves when typed on their own. With Control or Command held on a punctuation key they fall back, so German Cmd+ü still fires `Mod+[` (German types `[` with Option).
- On Windows, Control+Alt works like AltGr. On a layout with AltGr, browsers report Left Ctrl + Left Alt as AltGr, so a character it types matches only itself. German Ctrl+Alt+E types `€` and fires `€`, not `Control+Alt+E`. Polish Ctrl+Alt+A types `ą` and does not fire `Control+Alt+A`. Avoid `Control+Alt` with letters, digits, and symbols on Windows when users type in other languages.
- Named keys never fall back. With NumLock off, the numpad's 1 key reports `End`, so it fires `End` and not `1`. Numpad 5 has no navigation key, so with NumLock off it fires no digit, even in Firefox, which reports it as `Unidentified`.

When one key press could match several registrations on the same target, an exact match takes priority over a fallback.

A symbol that needs Shift on some layouts, such as `/` on German QWERTZ (Shift+7), matches when typed on its own. With Command held, macOS browsers report the unshifted character instead (`7`), so `Mod+/` can't match there. Register the per-layout combination as well, such as `Mod+Shift+7`.

The same report affects US keyboards. Cmd+Shift+/ arrives as `/` with Shift held, not as `?`. Shift is then a modifier of its own, so `Mod+/` does not fire for it, and `Mod+?` cannot match. Write the Shift the user presses: `Mod+Shift+/` for Cmd+?, and `Mod+Shift+=` next to `Mod+=` for zooming in with Cmd++. These bindings also fire on Windows and Linux, where the browser reports `?` and `+`. On a layout that types `/` with Shift, such as German QWERTZ, the same press is both: Ctrl+Shift+7 fires `Mod+Shift+/` when that is registered, and `Mod+/` otherwise. The digit row is the exception: Cmd+Shift+1 still fires `Mod+1`, because a French AZERTY Mac, which types digits with Shift, sends the same event.

Letters match without regard to case: `S` and `s` are the same binding.

Turkish dotless `ı` and dotted `İ` are letters of their own, not other cases of `I` and `i`. A binding for `ı` fires only on the key that types `ı`, and a binding for `İ` only on the key that types `İ`. `I` fires on the key that types `i`, and also on the key that types `ı`, as in native Windows apps, where that key is the I key. An `ı` binding takes priority there. The recorder records `ı` for the key that types it, and labels show `ı`.

### Match a key's position instead

When a shortcut should follow a position rather than a character, such as `W`/`A`/`S`/`D` movement in a game, use a physical binding. Physical bindings match `event.code` exactly and ignore the layout:

| Binding | Matches |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | The character S (`event.key`), with the fallbacks above |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | The key in the S position on a US layout (`event.code`) |
| `Enter` | Either Enter key, including the numpad's |
| `[Enter]` or `[NumpadEnter]` | Only that Enter key |

On a layout where the `KeyQ` position types `a`, `A` follows the character and `[KeyQ]` follows the position.

- In strings, every physical code goes in brackets, including codes that share a name with a logical key, such as `[Enter]` and `[F13]`. Codes are type-checked and autocomplete in your editor.
- In objects, use the `code` field for a physical binding and `key` for a logical one. A binding has one or the other, never both, and `key` never takes brackets.
- In a chord's callback, `context.parsedChord.code` is set only for physical bindings. The same goes for each step in a sequence's `context.parsedSequence`. Check `code !== undefined` before reading it.
- Labels show physical bindings without brackets, so `Mod+[KeyS]` displays as `⌘ S` on macOS. The stored binding keeps its brackets. Your framework's label primitive, such as `useFormatForDisplay`, labels a position with the character it types on the user's keyboard. That works only in Chromium browsers, such as Chrome and Edge, which report the layout. In Firefox and Safari, the label is the key's US character. Your framework's Formatting & Display guide has the details.

The [hotkey recorder](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#recording-captures-what-the-user-pressed) records a physical binding for a press that has no portable name, such as Shift+/. Set `recordBy: 'code'` to record one for every key.
