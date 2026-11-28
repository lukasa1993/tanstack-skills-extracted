# Formatting Display — Parse, compare, and store hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one is present before reading it:

```ts
import { normalizeHotkey, parseHotkey } from '@tanstack/angular-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
```

- **Normalize before saving.** `parseHotkey` resolves `Mod` for a specific platform (`meta: true` on macOS). Pass that same platform to `normalizeHotkey` to restore `'Mod+...'` before saving bindings intended to use `Mod`. Store registerable hotkey strings, never formatted labels. See [Write a chord as a string or an object](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md) for the forms a hotkey can take. Because normalizing on macOS turns `Meta+S` into `Mod+S`, keep the original registerable binding string if an explicit modifier must stay platform-specific.
- **Compare bindings.** `areHotkeysEqual(a, b)` checks semantic equality after resolving modifiers, so `'Mod+S'` equals `'Meta+S'` on macOS. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` unwraps a one-step sequence into a chord.
- **Validate untrusted strings.** Pass hotkeys loaded from storage or user input to `validateHotkey`. It returns `{ valid, errors, warnings }`, where each issue includes:
  - `reason`, a machine-readable code such as `'unknown-modifier'`
  - `part`, the offending token
  - `step`, the zero-based step index for sequences

`validateHotkey` checks syntax only and can't promise that the browser or operating system delivers the shortcut, so map `reason` codes to your own UI strings. To validate as users press keys, see [Validate and check conflicts](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#source-hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md).

Try these options together with the format toggles in the [server-rendered cheat sheet example](https://github.com/TanStack/hotkeys/tree/a3fc3ae3a058631dfe821a04edf4cf0cce49fb0a/examples/angular/injectFormatForDisplay-angular-ssr). For a full list of your app's shortcuts, see [Cheat Sheets](./hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md-725426f1.md#source-hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md).
