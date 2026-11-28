# Formatting Display — Parse, compare, and store hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/alpine-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

- **Normalize before saving.** A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#source-hotkeys-docs-framework-alpine-guides-hotkeys-md) covers the forms a hotkey can take. Because normalizing on macOS turns `Meta+S` into `Mod+S`, keep the original registerable binding string if an explicit modifier must stay platform-specific.
- **Compare bindings.** `areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.
- **Validate untrusted strings.** Pass a hotkey from a settings file or user input to `validateHotkey`. It returns `{ valid, errors, warnings }`, and each issue includes:
  - `reason`, a machine-readable code such as `'unknown-modifier'`
  - `part`, the token the issue is about
  - `step`, the zero-based step index for a sequence

`validateHotkey` checks syntax only. It can't promise that the browser or operating system delivers the shortcut. The library sends no text, so map each `reason` code to your own messages. The devtools describe each problem in the details of a hotkey. To check hotkeys as users record them, see [Validate and check conflicts](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md#source-hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md).

For a full list of your app's shortcuts, see [Cheat Sheets](./hotkeys-docs-framework-alpine-guides-cheat-sheet-ui-helpers-md-c2bc3613.md#source-hotkeys-docs-framework-alpine-guides-cheat-sheet-ui-helpers-md).
