# Sensible Defaults — Keys match the character the user types

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Keys match the character the user types

Logical bindings like `Mod+S` or `?` match `event.key`, which is the character produced on the user's active keyboard layout. Matching is case-insensitive, so `S` and `s` are identical. A user on Dvorak, Colemak, or AZERTY presses the key labeled `S` to trigger `Mod+S`, wherever it sits physically.

### When matching falls back to physical position

`event.key` doesn't always tell you which key was pressed, so the matcher falls back to the key's position (`event.code` or keycap identity) in these cases:

- **Non-Latin layouts.** On a Russian layout, the `S` key types `ы`. `Mod+S` still matches so shortcuts work without switching layouts.
- **macOS `Option`.** Option changes characters (`Option+S` types `ß`, German `Option+L` types `@`). `Alt+S` and `Alt+L` still match based on the letter printed on the key (`event.keyCode`, falling back to position when `keyCode` isn't a letter). On a French AZERTY Mac, `Alt+A` fires on the key labeled `A` (the US `Q` position).
- **Dead keys and the digit row.** Dead keys report `'Dead'`, and layouts like AZERTY type `&` and `é` on the unshifted digit row. Position fallback keeps `Mod+1` working.
  - *Zoom shortcut exception.* When a digit key types `-`, `+`, or `=` (such as `-` on AZERTY's `6` key), pressing `Control` (or `Command` on macOS) with it lets the browser zoom instead of firing `Mod+6`. `Ctrl+Shift+6` still fires `Mod+6`.
  - *Rare layouts without shifted digits.* Thai (`3` key) and Programmer Dvorak (`6` and `9` keys) don't type digits even with Shift. Add a physical fallback like `Mod+[Digit3]` if you need those keys everywhere.
- **Symbols typed with Shift on digits.** `Shift+1` types `!` on a US layout, and `Shift+1` still matches.
- **`Shift` with a US punctuation key.** `Shift+-` means the `_` that US `Shift+-` types, and `Shift+/` means `?`, wherever the layout puts them. On German QWERTZ, `Shift+-` fires on the key that types `_`, and `Shift+ß` (which types `?`) fires `Shift+/`, not `Shift+-`. Other symbols typed with `Shift` on a punctuation key, such as UK `Shift+'` typing `@`, keep the key's position.
- **Greek and Hebrew Q key.** Greek types `;` and Hebrew types `/` on the Q key. `Mod+Q` still fires there when the browser's legacy `keyCode` names Q: on Windows, and for Hebrew in Chromium and Firefox on Linux. Greek `Ctrl+Q` in Chromium on Linux reports the code of `;`, so it fires `Mod+;` and not `Mod+Q`. To catch it there too, also register `Mod+[KeyQ]` with the same callback. On a US keyboard, the physical binding then fires instead of `Mod+Q`, not with it. On AZERTY, `[KeyQ]` is the key labeled `A`, so add it only where Greek users need it.

### When the reported character wins (and layout quirks)

Outside the fallbacks above, the character the key types wins even if that key sits in a different spot than on US QWERTY:

- **Letters and non-digit symbols.** Outside the digit row, ASCII letters never fall back. ASCII symbols fall back only with `Shift` on a punctuation key, or when macOS `Option` typed them on a letter key. On AZERTY, the key in the US `/` position types `+`, so `Cmd++` zooms instead of firing `Mod+/`, and `Shift+,` types `?`, which fires `Shift+/` and not `Shift+M`. On Dvorak, typing `'` doesn't fire `Q`.
- **Dead keys pressed alone.** A dead key falls back to its position only on a letter key, on the digit row, or where US International puts its accent (`'` and `` ` ``). Swiss German `^` on the US `=` key doesn't fire `=`. With `Control`, `Alt` or `Command` held, a dead key keeps its position.
- **Accented Latin letters (`ü`, `ö`, `ø`).** Match only themselves when pressed alone, but fall back on punctuation keys when held with `Control` or `Command`. German `Cmd+ü`, for example, still triggers `Mod+[`.
- **Turkish `ı` and `İ`.** Treated as distinct letters, not case variants of `I` and `i`. `ı` and `İ` match only themselves. `I` matches `i` and `I`, and also falls back on `ı`, with an explicit `ı` binding taking priority.
- **macOS `Cmd+Shift+symbol`.** With `Command` held, macOS browsers report the unshifted key (`/` instead of `?`). On the key's US position, the press fires the character US `Shift` types there, as on Windows: `Cmd+Shift+/` fires `Mod+?`, and `Mod+Shift+/` too, which ranks first. `,` and `.` are exempt, because most layouts with them in the US position type `;` and `:` there with `Shift`, so `Cmd+Shift+,` and `Cmd+Shift+.` don't fire `Mod+<` and `Mod+>` on macOS; register `Mod+Shift+,` and `Mod+Shift+.` alongside them. `Mod+/` won't match because `Shift` is held. Bind `Mod+Shift+=` alongside `Mod+=` for zoom in. On German QWERTZ, symbols typed with `Shift` (such as `/` on `Shift+7`) also report the unshifted character (`7`) with `Command` on macOS, so register `Mod+Shift+7` as well. On Windows and Linux, `Ctrl+Shift+7` on QWERTZ fires `Mod+Shift+/` when registered, and `Mod+/` otherwise. The digit row is exempt so AZERTY Mac `Cmd+Shift+1` still fires `Mod+1`. For the same reason, `Mod+!` never fires on a US Mac, where `Cmd+Shift+1` reports `1`; register `Mod+Shift+1`. Development builds warn when you register `Mod+!` or `Mod+<` for macOS.
- **Named keys and numpad.** Named keys never fall back. With NumLock off, Numpad `1` reports `End` and triggers `End` rather than `1`, and Numpad `5` fires no digit even in Firefox (`Unidentified`).
- **Priority.** The active scope decides first: when chords in two scopes on the same target match one press, the nested or most recently activated scope handles it, even if the other scope's binding matches more exactly. Within that scope, when one press could match both an exact character binding and a fallback on the same target, the exact match wins. When a logical and a physical binding on the same target and phase both match exactly, such as `Enter` and `[NumpadEnter]` on Numpad Enter, the physical one wins.

### Match a key's position instead

When a shortcut should follow physical keyboard geometry instead of characters, such as `W`, `A`, `S`, `D` game movement, use a physical binding. Physical bindings match `event.code` directly and ignore layout:

| Binding | Matches |
| --- | --- |
| `Mod+S` or `{ key: 'S', mod: true }` | The character `S` (`event.key`), with the fallbacks above |
| `Mod+[KeyS]` or `{ code: 'KeyS', mod: true }` | The physical `S` key on a US layout (`event.code`) |
| `Enter` | Either Enter key, including the numpad's, unless `[NumpadEnter]` is also registered on the same target |
| `[Enter]` or `[NumpadEnter]` | Only that specific Enter key |

- **String syntax.** Wrap every physical code in brackets, including keys that share a logical name like `[Enter]` and `[F13]`. Editor autocomplete and type checking apply to all codes.
- **Object syntax.** Use `code` for physical bindings and `key` for logical ones. Never pass both, and never put brackets inside `key`.
- **Callback context.** `context.parsedChord.code` (and `step.code` in sequences) is only defined for physical bindings. Check `code !== undefined` before reading it.
- **Display labels.** Brackets are stripped in UI labels, so `Mod+[KeyS]` displays as `⌘ S` on macOS. In Chromium browsers (Chrome and Edge), your adapter's label formatter swaps physical keys for the character printed on the user's actual layout. Firefox and Safari fall back to the US label.

### Type keys from other keyboard layouts

By default, hotkey strings type-check against US QWERTY keys. Most apps never need to change this, because A to Z, 0 to 9, and common US punctuation already match across international layouts at runtime.

To type-check layout-specific keys such as `Ö`, `ß`, or `§`, register those layout sets through module augmentation (see your framework's Keyboard Layouts guide). Registering sets changes types only. Matching behavior and bundle size stay identical.

Each set covers layout-specific keys and punctuation typed unshifted or with `Shift` across Windows, macOS, and Linux, omitting dead keys and `AltGr` or `Option` characters. Letters typed with `Shift` require `Shift+` in the hotkey.

- **Americas.** `UsKeys`, `BrazilianKeys`, `LatinAmericanKeys`, `CanadianFrenchKeys`
- **Western Europe.** `UkKeys`, `GermanKeys`, `AustrianKeys`, `SwissGermanKeys`, `SwissFrenchKeys`, `FrenchKeys`, `BelgianKeys`, `SpanishKeys`, `PortugueseKeys`, `ItalianKeys`
- **Nordic.** `DanishKeys`, `NorwegianKeys`, `SwedishKeys`, `FinnishKeys`, `IcelandicKeys`
- **Central and Eastern Europe.** `CzechKeys`, `SlovakKeys`, `HungarianKeys`, `CroatianKeys`, `SlovenianKeys`, `SerbianLatinKeys`, `EstonianKeys`, `LithuanianKeys`, `RomanianKeys`, `TurkishKeys`
- **Non-Latin.** `GreekKeys`, `RussianKeys`, `UkrainianKeys`, `BulgarianKeys`, `HebrewKeys`

Polish and Latvian share US QWERTY base keys without `AltGr`, and most Dutch users use US International, so they don't need a separate set.
