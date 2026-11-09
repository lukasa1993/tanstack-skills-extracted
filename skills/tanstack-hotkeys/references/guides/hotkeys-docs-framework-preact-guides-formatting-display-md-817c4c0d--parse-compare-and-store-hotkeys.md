# Formatting Display — Parse, compare, and store hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { formatForDisplay, normalizeHotkey, parseHotkey } from '@tanstack/preact-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
formatForDisplay(stored, { platform: 'windows' }) // 'Ctrl+S'
```

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`. Each error or warning has a `reason` code, such as `'unknown-modifier'`, the `part` it's about, and for a sequence, the index of the `step`. The library sends no text, so write your own messages for users. The devtools describe each problem in the details of a hotkey. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./hotkeys-docs-framework-preact-guides-custom-hotkey-recording-md-816282c2.md#source-hotkeys-docs-framework-preact-guides-custom-hotkey-recording-md).

Try these options together with the format toggles in the [server-rendered cheat sheet example](https://github.com/TanStack/hotkeys/tree/a9dd5ea3fb8a4d3d660638add1766bc35ef114f6/examples/preact/useFormatForDisplay-astro). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md-0544b194.md#source-hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md).
