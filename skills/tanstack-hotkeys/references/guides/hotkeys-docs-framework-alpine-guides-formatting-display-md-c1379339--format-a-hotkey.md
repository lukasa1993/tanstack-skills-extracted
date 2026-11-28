# Formatting Display — Format a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format a hotkey

Call `createFormatForDisplay` on an owner from `createHotkeysScope`. It returns the function that formats a hotkey:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('saveButton', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()

  return {
    get label() {
      return formatForDisplay('Mod+S')
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<button x-data="saveButton" type="button">
  Save <kbd x-text="label"></kbd>
</button>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The function fills in the following for you:

- **The platform** from the default options of `createHotkeysScope`, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md#label-physical-keys-for-the-users-keyboard).

Call `createFormatForDisplay` once, then call the function anywhere in the component, including in loops and conditions. To call it from markup, such as `x-text="formatForDisplay(hotkey)"`, return the function from the component. Don't call `createFormatForDisplay` itself in a reactive expression, where each evaluation adds a new subscription. Options go in the function's second argument. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. The extra ISO and JIS keys, which have no US key, use their keycap legends: `[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, and `[IntlYen]` shows `¥`. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

A `platform` you pass wins over the owner's. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

The function accepts hotkeys only, including single keys such as `'Escape'` and modifiers on their own such as `'Shift'`. A key from a `KeyboardEvent`, such as a held key, can be outside the key types: pass it as `{ key }`.

To set the platform yourself, such as in a test, pass `platform` in the default options of `createHotkeysScope`. It is also the default platform for the owner's hotkeys and recorders:

```ts
const hotkeys = createHotkeysScope({ platform: 'mac' })
```
