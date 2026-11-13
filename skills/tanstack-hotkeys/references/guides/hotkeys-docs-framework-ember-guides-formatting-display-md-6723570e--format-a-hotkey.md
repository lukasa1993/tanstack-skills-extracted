# Formatting Display — Format a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Format a hotkey

Call `useFormatForDisplay` in a class field of a component. It returns the function that formats a hotkey, and the template can call it as a helper:

```gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'

export default class SaveButton extends Component {
  formatForDisplay = useFormatForDisplay()

  <template>
    <button type="button">
      Save <kbd>{{this.formatForDisplay 'Mod+S'}}</kbd>
    </button>
  </template>
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. The utility fills in two things for you:

- **The platform** from the `createHotkeysScope` scope you pass it, or the detected platform without one.
- **The user's keyboard layout**, for physical keys, in Chromium browsers. See [Label physical keys for the user's keyboard](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#label-physical-keys-for-the-users-keyboard).

Call the utility once, then call the function anywhere in the component: in the template, in a getter, or in a method. Options go in its second argument. In a template, build them with the `hash` helper from `@ember/helper`, such as `{{this.formatForDisplay 'Mod+S' (hash platform='mac')}}`. The examples in this guide pass `platform`, so each one has a single result:

```ts
formatForDisplay('Mod+S', { platform: 'mac' }) // '⌘ S'
formatForDisplay('Mod+[KeyS]', { platform: 'mac' }) // '⌘ S'
formatForDisplay({ code: 'KeyS', mod: true }, { platform: 'windows' }) // 'Ctrl+S'
formatForDisplay('Mod+[Digit2]', { platform: 'windows' }) // 'Ctrl+2'
```

The same label can stand for different hotkeys. `Mod+S` follows the character S, and `Mod+[KeyS]` follows the key in the S position. See [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). Labels for positions shorten `KeyS` to `S` and `Digit2` to `2`, keep readable numpad labels, and reuse punctuation and special-key symbols. The extra ISO and JIS keys, which have no US key, use their keycap legends: `[IntlBackslash]` shows `\`, `[IntlRo]` shows `\`, and `[IntlYen]` shows `¥`. Formatting doesn't change the stored hotkey or guess the user's keyboard layout.

A `platform` you pass wins over the scope's. On macOS, the label joins modifier symbols with spaces. Windows and Linux use names joined with `+`. macOS orders modifiers as Control, Option, Shift, Command, so `Mod+Shift+S` displays as `⇧ ⌘ S`, while the hotkey itself stays `Mod+Shift+S`.

The function accepts hotkeys only, including single keys such as `'Escape'` and modifiers on their own such as `'Shift'`. A key from a `KeyboardEvent`, such as a held key, can be outside the key types: pass it as `{ key }`.
