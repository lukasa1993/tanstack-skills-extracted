# Formatting Display — Parse, compare, and store hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-formatting-display-md-505d4885.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Parse, compare, and store hotkeys

`parseHotkey` returns each chord's key, as either a logical `key` or a physical `code`, plus its modifiers with `Mod` resolved. Check which one you have before reading it:

```ts
import { formatForDisplay, normalizeHotkey, parseHotkey } from '@tanstack/svelte-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
  console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkey(parsed, 'mac') // 'Mod+[KeyS]'
formatForDisplay(stored, { platform: 'windows' }) // 'Ctrl+S'
```

A parsed chord's modifiers are already resolved for one platform. To store it as a hotkey that works on every platform, normalize it with that same platform, as above. `normalizeHotkey` also accepts chord strings, chord objects, and sequences. Store hotkeys, never display labels. [Write a chord as a string or an object](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-md) covers the forms a hotkey can take.

`areHotkeysEqual(a, b)` compares chords or sequences after resolving modifiers, so `Mod+S` equals `Meta+S` on macOS. Sequences compare step by step. `isHotkeySequence` narrows a `Hotkey` to a sequence, and `simplifyHotkey` turns a one-step sequence into its chord.

Use `validateHotkey` when you accept a hotkey from somewhere else, such as a settings file. It returns `valid`, `errors`, and `warnings`. Each error or warning has a `reason` code, such as `'unknown-modifier'`, the `part` it's about, and for a sequence, the index of the `step`. The library sends no text, so write your own messages for users. The devtools describe each problem in the details of a hotkey. It can't promise that the browser or operating system delivers the shortcut. To check hotkeys as users record them, see [Validate and check conflicts](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md#source-hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md).

Try these options together with the format toggles in the [server-rendered cheat sheet example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/svelte/getFormatForDisplay-sveltekit). For a full list of your app's shortcuts, see [Cheat Sheet UI Helpers](./hotkeys-docs-framework-svelte-guides-cheat-sheet-ui-helpers-md-95cb1921.md#source-hotkeys-docs-framework-svelte-guides-cheat-sheet-ui-helpers-md).
