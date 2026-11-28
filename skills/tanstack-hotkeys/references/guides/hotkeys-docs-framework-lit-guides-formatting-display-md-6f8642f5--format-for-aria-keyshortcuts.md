# Formatting Display — Format for `aria-keyshortcuts`

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format for `aria-keyshortcuts`

`FormatForAriaController` provides a `format` function for the [`aria-keyshortcuts`](https://w3c.github.io/aria/#aria-keyshortcuts) attribute so screen readers can announce a shortcut. It uses the same platform and keyboard layout as `FormatForDisplayController`. See [Accessibility](./hotkeys-docs-framework-lit-guides-accessibility-md-fbdd0cf1.md#source-hotkeys-docs-framework-lit-guides-accessibility-md) for where to place the attribute.

```ts
import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import {
  FormatForAriaController,
  FormatForDisplayController,
  hotkey,
} from '@tanstack/lit-hotkeys'

class SearchButton extends LitElement {
  private formatForAria = new FormatForAriaController(this)
  private formatForDisplay = new FormatForDisplayController(this)

  @hotkey('Mod+K')
  openSearch() {
    // ...
  }

  render() {
    return html`
      <button
        @click=${this.openSearch}
        aria-keyshortcuts=${ifDefined(this.formatForAria.format('Mod+K'))}
      >
        Search <kbd>${this.formatForDisplay.format('Mod+K')}</kbd>
      </button>
    `
  }
}
```

The output uses the key names from the ARIA specification:

- **Modifiers.** `Mod` becomes `Meta` on macOS and `Control` elsewhere. Modifiers use `Control`, `Alt`, `Shift`, and `Meta` in that order before the key, so `Mod+Shift+P` formats as `Shift+Meta+P` on macOS.
- **Keys.** Keys use `KeyboardEvent.key` values (`K`, `/`, `Escape`, `ArrowUp`), with `Space` for the space bar and `Plus` for the plus key. A physical binding names the key at that position from the user's keyboard layout where the browser reports it, so `[KeyQ]` formats as `Q`, or `A` on a French AZERTY keyboard. A logical hotkey's punctuation stays as written, so `'?'` formats as `?` rather than the `Shift+/` you press on a US keyboard. The key that types `?` depends on the layout. For punctuation that takes `Shift` to type, pass your own `aria-keyshortcuts` value for the layout, or use a physical binding such as `Shift+[Slash]`, which also changes which key the hotkey matches.
- **No value.** Returns `undefined` for a multi-step sequence, a standalone modifier, an empty or `null` hotkey, or a physical code with no key name such as `[NumpadMemoryAdd]`, so `ifDefined` omits the attribute. ARIA has no syntax for multi-step sequences. The adapter's formatter also returns `undefined` while the hotkey can't fire, such as when it is disabled, its scope is suspended, character keys are suspended, or nothing has registered it, so a screen reader doesn't announce a shortcut that no registration can fire. The plain `formatForAria` function only formats.

For a control with two shortcuts, join both formatted values with a space, such as `Control+K /`.
