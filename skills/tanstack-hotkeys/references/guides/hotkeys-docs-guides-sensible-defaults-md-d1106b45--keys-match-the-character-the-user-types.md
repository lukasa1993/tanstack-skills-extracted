# Sensible Defaults — Keys match the character the user types

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Keys match the character the user types

A logical binding such as `Mod+S` or `?` matches `event.key`, the character the key produces on the active keyboard layout. A user on Dvorak, Colemak, or AZERTY presses the key labeled S to trigger `Mod+S`, wherever that key sits on their keyboard. Matching the key's position (`event.code`) instead would make `Mod+Z` fire on the AZERTY key labeled W, and on Dvorak would turn the key labeled X into a different shortcut.

`event.key` is not always useful, so the matcher falls back to the key's conventional position when the character cannot identify the shortcut:

- **Non-Latin layouts.** On a Russian layout, the S position types `ы`. `Mod+S` still matches there, so shortcuts work without switching layouts.
- **macOS Option.** Option changes the character, so Option+S types `ß`. `Alt+S` still matches.
- **Dead keys and shifted characters.** A dead key reports `Dead`, and AZERTY's digit row types `é` for `2`. The key's position resolves the shortcut.

ASCII letters never fall back. If a key types `x`, it matches `X` and nothing else, so a positional fallback can never hijack a Dvorak or Colemak user's shortcut. When one key press could match several registrations on the same target, an exact match takes priority over a fallback.

Letters match without regard to case: `S` and `s` are the same binding.

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
- `formatForDisplay` labels physical bindings without brackets, so `Mod+[KeyS]` displays as `⌘ S` on macOS. The stored binding keeps its brackets.

The [hotkey recorder](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#recording-captures-what-the-user-pressed) records positions by default, so recorded hotkeys are physical bindings.
