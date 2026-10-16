# Sensible Defaults — Keys match the character the user types

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Keys match the character the user types

A logical binding such as `Mod+S` or `?` matches `event.key`, the character the key produces on the active keyboard layout. A user on Dvorak, Colemak, or AZERTY presses the key labeled S to trigger `Mod+S`, wherever that key sits on their keyboard. Matching the key's position (`event.code`) instead would make `Mod+Z` fire on the AZERTY key labeled W, and on Dvorak would turn the key labeled X into a different shortcut.

`event.key` is not always useful, so the matcher falls back to the key's conventional position when the character cannot identify the shortcut:

- **Non-Latin layouts.** On a Russian layout, the S position types `ы`. `Mod+S` still matches there, so shortcuts work without switching layouts.
- **macOS Option.** Option changes the character, so Option+S types `ß`. `Alt+S` still matches.
- **Dead keys and shifted characters.** A dead key reports `Dead`, and AZERTY's digit row types `é` for `2`. The key's position resolves the shortcut.

ASCII letters never fall back. If a key types `x`, it matches `X` and nothing else, so a positional fallback can never hijack a Dvorak or Colemak user's shortcut. When one key press could match several registrations on the same target, an exact match takes priority over a fallback.

Letters match without regard to case: `S` and `s` are the same binding.

When a shortcut should follow a position rather than a character, such as `W`/`A`/`S`/`D` movement in a game, use a physical binding with a bracketed code: `[KeyW]`. Physical bindings match `event.code` exactly and ignore the layout.
