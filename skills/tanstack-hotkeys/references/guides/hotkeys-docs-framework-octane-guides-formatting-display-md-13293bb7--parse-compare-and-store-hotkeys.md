# Formatting Display — Parse, compare, and store hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Parse, compare, and store hotkeys

Use the core helpers for persistence, comparison, and validation:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/octane-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS' (parsed.key is undefined)
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

- **Normalize before saving.** `parseHotkey` resolves `Mod` for a specific platform (`meta: true` on Mac). Pass that same platform to `normalizeHotkey` to restore `'Mod+...'` before saving bindings intended to use `Mod`. Store registerable hotkey strings, never formatted labels. Because normalizing on macOS turns `Meta+S` into `Mod+S`, keep the original registerable binding string if an explicit modifier must stay platform-specific.
- **Compare bindings.** `areHotkeysEqual(a, b)` checks semantic equality after resolving modifiers, so `'Mod+S'` equals `'Meta+S'` on macOS. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` unwraps a 1-step sequence into a chord.
- **Validate untrusted strings.** Pass hotkeys loaded from storage or user input to `validateHotkey`. It returns `{ valid, errors, warnings }`, where each issue includes:
  - `reason`, a machine-readable code such as `'unknown-modifier'`
  - `part`, the offending token
  - `step`, the zero-based step index (for sequences)

`validateHotkey` checks syntax only, so map `reason` codes to your own UI strings. To validate as users press keys, see [Validate and check conflicts](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md#source-hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md).

Try these formatting options interactively in the [Astro example](https://github.com/TanStack/hotkeys/tree/a3fc3ae3a058631dfe821a04edf4cf0cce49fb0a/examples/octane/useFormatForDisplay-astro), or see [Cheat Sheets](./hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md-3e802195.md#source-hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md) for rendering full shortcut lists.
