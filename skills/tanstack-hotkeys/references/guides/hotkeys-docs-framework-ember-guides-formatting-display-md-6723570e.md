# Formatting Display

<a id="source-hotkeys-docs-framework-ember-guides-formatting-display-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

[Topic index](../other-guides.md) · [Source provenance](../SOURCES.md)

This section is an exact duplicate. Read [Overview in Formatting Display](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md).

## Format a binding

```ts
import { formatForDisplay } from '@tanstack/ember-hotkeys'

formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can represent different bindings. `Mod+S` follows a logical letter; `Mod+[KeyS]` follows a physical position. Physical labels shorten `KeyS` to `S` and `Digit2` to `2`, preserve readable numpad labels, and reuse punctuation and special-key symbols. This does not change the stored code or infer the user's layout.

Omit `platform` to use detection. On macOS the default joins modifier symbols with spaces; Windows and Linux use labels joined with `+`. macOS display orders modifiers as Control, Option, Shift, Command: `Mod+Shift+S` displays as `⇧ ⌘ S`. The normalized binding remains `Mod+Shift+S`.

## Render individual keycaps

Set `parts: true` to get one label per key instead of a joined string:

```ts
const binding = 'Mod+[KeyS]'
const parts = formatForDisplay(binding, { platform: 'mac', parts: true })
// ['⌘', 'S']; render each part in its own <kbd>
```

With `parts` omitted or false, the result is a string. A runtime boolean returns `string | string[]`. Parts preserve literal plus keys and ignore `separatorToken`.

Sequences are arrays of bindings. Format their steps individually:

```ts
import type { HotkeySequence } from '@tanstack/ember-hotkeys'

const sequence: HotkeySequence = ['Mod+[KeyK]', 'C']
const label = sequence.map((step) => formatForDisplay(step)).join(' → ')
```

`formatHotkeySequence` only joins stored strings with spaces. It intentionally retains brackets and code names, so use the code above for user-facing labels.

## Choose symbols and separators

This section is an exact duplicate. Read [Choose symbols and separators in Formatting Display](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md).

## Supply layout labels

This section is an exact duplicate. Read [Supply layout labels in Formatting Display](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md).

## Parse and store bindings

`parseHotkey` returns either a logical `key` or a physical `code`, plus resolved modifier flags. Narrow the union before inspecting the identity:

```ts
import { parseHotkey, normalizeHotkeyFromParsed } from '@tanstack/ember-hotkeys'

const parsed = parseHotkey('Mod+[KeyS]', 'mac')
if (parsed.code !== undefined) {
	console.log(parsed.code) // 'KeyS'; parsed.key is undefined
}
const stored = normalizeHotkeyFromParsed(parsed, 'mac') // 'Mod+[KeyS]'
formatForDisplay(stored, { platform: 'windows' }) // 'Ctrl+S'
```

Parsed modifiers are already resolved. To display a portable `Mod` binding on another platform, serialize with the original platform first, as above. `normalizeRegisterableHotkey` accepts strings or raw objects and preserves the logical/physical distinction. Do not store display labels or put a bracketed code in a logical `key` field.

Use `validateHotkey` when accepting strings from an external source. It returns `valid`, `errors`, and `warnings`; it does not guarantee that a browser or operating system will deliver the shortcut. Recorder validation and live conflict checks are covered in the [recording guide](./hotkeys-docs-framework-ember-guides-hotkey-recording-md-e4d4b8dd.md#source-hotkeys-docs-framework-ember-guides-hotkey-recording-md).

Try these options together in the [vanilla formatter playground](https://github.com/TanStack/hotkeys/tree/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/examples/vanilla/formatForDisplay).
