# Formatting Display — Format a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format a hotkey

Call `createFormatForDisplay` in a component, then call the returned function wherever shortcuts render:

```tsx
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'

function SaveButton() {
  const formatForDisplay = createFormatForDisplay()

  return (
    <button>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
    </button>
  )
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The primitive wires up the following automatically:

- **Platform.** Reads the nearest `HotkeysProvider`, or detects from `navigator` if there isn't one.
- **Keyboard layout.** For physical codes like `[KeyW]`, reads the user's keyboard layout in Chromium browsers.

Call the returned function anywhere in the component, including inside `<For>` loops and conditionals. Pass a second argument to override the platform or formatting for one call. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

How chords format:

- **macOS.** Uses symbols joined with spaces in Control, Option, Shift, Command order (`Mod+Shift+S` displays as `⇧ ⌘ S`, while the underlying hotkey stays `Mod+Shift+S`).
- **Windows and Linux.** Uses modifier names joined with `+` (`Ctrl+Shift+S`).
- **Physical codes.** Strips brackets and shortens prefixes (`KeyS` to `S`, `Digit2` to `2`), keeping readable numpad, punctuation, and ISO or JIS keycap legends (`[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, `[IntlYen]` shows `¥`).
- **Accepted inputs.** Accepts any chord, sequence, single key (`'Escape'`), or standalone modifier (`'Shift'`). For a raw key string from a `KeyboardEvent`, such as a held key outside the strict `Key` union, wrap it as `{ key }`.
