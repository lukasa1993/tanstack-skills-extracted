# Formatting Display — Format a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Format a hotkey

Create a `FormatForDisplayController` as a class field. Its `format` function formats a hotkey:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { FormatForDisplayController } from '@tanstack/lit-hotkeys'

@customElement('save-button')
class SaveButton extends LitElement {
  private formatForDisplay = new FormatForDisplayController(this)

  render() {
    return html`
      <button>
        Save <kbd>${this.formatForDisplay.format('Mod+S')}</kbd>
      </button>
    `
  }
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The controller fills in two things for you:

- **The platform** from the controller's `platform` option, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md#label-physical-keys-for-the-users-keyboard).

Create the controller once, then call `format` anywhere in the element, including in loops and conditions. Options go in its second argument. `format` needs no `this`, so you can put it in a variable. The examples in this guide do, and pass `platform`, so each one has a single result:

```ts
const formatForDisplay = this.formatForDisplay.format

formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. The extra ISO and JIS keys, which have no US key, use their keycap legends: `[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, and `[IntlYen]` shows `¥`. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

A `platform` you pass wins over the controller's. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

The function accepts hotkeys only, including single keys such as `'Escape'` and modifiers on their own such as `'Shift'`. A key from a `KeyboardEvent`, such as a held key, can be outside the key types: pass it as `{ key }`.
