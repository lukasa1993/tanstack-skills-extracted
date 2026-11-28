# Formatting Display — Format for `aria-keyshortcuts`

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format for `aria-keyshortcuts`

`useFormatForAria()` returns a function that formats a hotkey for the [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute so screen readers can announce it. It uses the same platform and keyboard layout as the display formatter. See [Accessibility](./hotkeys-docs-framework-ember-guides-accessibility-md-63e1477f.md#source-hotkeys-docs-framework-ember-guides-accessibility-md) for where to place the attribute.

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { useFormatForAria, useFormatForDisplay } from '@tanstack/ember-hotkeys'
import type { EmberHotkeysScope } from '@tanstack/ember-hotkeys'

class SearchButton extends Component<{ Args: { hotkeys: EmberHotkeysScope } }> {
  formatForAria = useFormatForAria(this.args.hotkeys)
  formatForDisplay = useFormatForDisplay(this.args.hotkeys)
  search = () => openSearch()

  <template>
    {{this.args.hotkeys.useHotkey 'Mod+K' this.search}}
    <button
      type="button"
      aria-keyshortcuts={{this.formatForAria "Mod+K"}}
      {{on "click" this.search}}
    >
      Search <kbd>{{this.formatForDisplay "Mod+K"}}</kbd>
    </button>
  </template>
}
```

The output uses the key names from the ARIA specification:

- **Modifiers.** `Mod` becomes `Meta` on macOS and `Control` elsewhere. Modifiers use `Control`, `Alt`, `Shift`, and `Meta` in that order before the key, so `Mod+Shift+P` formats as `Shift+Meta+P` on macOS.
- **Keys.** Keys use `KeyboardEvent.key` values (`K`, `/`, `Escape`, `ArrowUp`), with `Space` for the space bar and `Plus` for the plus key. A physical binding names the key at that position from the user's keyboard layout where the browser reports it, so `[KeyQ]` formats as `Q`, or `A` on a French AZERTY keyboard. A logical hotkey's punctuation stays as written, so `'?'` formats as `?` rather than the `Shift+/` you press on a US keyboard. The key that types `?` depends on the layout. For punctuation that takes `Shift` to type, pass your own `aria-keyshortcuts` value for the layout, or use a physical binding such as `Shift+[Slash]`, which also changes which key the hotkey matches.
- **No value.** Returns `undefined` for a multi-step sequence, a standalone modifier, an empty or `null` hotkey, or a physical code with no key name such as `[NumpadMemoryAdd]`, so Glimmer omits the attribute. ARIA has no syntax for multi-step sequences. The adapter's formatter also returns `undefined` while the hotkey can't fire, such as when it is disabled, its scope is suspended, character keys are suspended, or nothing has registered it, so a screen reader doesn't announce a shortcut that no registration can fire. The plain `formatForAria` function only formats.

For a control with two shortcuts, join both formatted values with a space, such as `Control+K /`.
