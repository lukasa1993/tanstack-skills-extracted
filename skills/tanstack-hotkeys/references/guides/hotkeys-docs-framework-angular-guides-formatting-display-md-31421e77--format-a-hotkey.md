# Formatting Display — Format a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format a hotkey

Call `injectFormatForDisplay` in an injection context, such as a field initializer. It returns the function that formats a hotkey:

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-save-button',
  template: `
    <button>
      Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
    </button>
  `,
})
export class SaveButtonComponent {
  readonly formatForDisplay = injectFormatForDisplay()
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `injectFormatForDisplay` fills in the following for you:

- **Platform.** Reads the nearest `provideHotkeys`, or detects it from `navigator` when there is none.
- **Keyboard layout.** For physical codes such as `[KeyW]`, reads the user's keyboard layout in Chromium browsers. See [Label physical keys for the user's keyboard](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md#label-physical-keys-for-the-users-keyboard).

Inject it once, then call the function anywhere in the component, including in templates and in `computed`. Options go in its second argument. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

How chords format:

- **macOS.** Uses symbols joined with spaces in Control, Option, Shift, Command order, so `Mod+Shift+S` displays as `⇧ ⌘ S` while the hotkey itself stays `Mod+Shift+S`.
- **Windows and Linux.** Uses modifier names joined with `+`, such as `Ctrl+Shift+S`.
- **Physical codes.** Strips brackets and shortens prefixes (`KeyS` to `S`, `Digit2` to `2`), keeping readable numpad, punctuation, and ISO or JIS keycap legends (`[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, `[IntlYen]` shows `¥`).
- **Accepted inputs.** Accepts any chord, sequence, single key such as `'Escape'`, or standalone modifier such as `'Shift'`. For a raw key string from a `KeyboardEvent`, such as a held key outside the strict `Key` union, wrap it as `{ key }`.

A `platform` you pass wins over the provider's. `Mod+S` follows the character S, while `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). Formatting never changes the stored hotkey or guesses the user's keyboard layout.
