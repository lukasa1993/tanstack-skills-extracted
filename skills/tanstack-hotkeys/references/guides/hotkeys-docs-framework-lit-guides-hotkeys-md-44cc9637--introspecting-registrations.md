# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Introspecting registrations

Use `HotkeyRegistrationsController` to get a live view of all hotkey and sequence registrations. Use it to build shortcut palettes, help dialogs, or devtools.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRegistrationsController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-palette')
class ShortcutPalette extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    const { hotkeys, sequences } = this.registrations

    return html`
      <h2>Keyboard Shortcuts</h2>
      <ul>
        ${hotkeys.map(
          (reg) => html`
            <li>
              <kbd>${formatForDisplay(reg.hotkey)}</kbd>
              ${reg.options.meta?.name ? html`<span> — ${reg.options.meta.name}</span>` : ''}
              ${reg.options.meta?.description ? html`<p>${reg.options.meta.description}</p>` : ''}
            </li>
          `,
        )}
      </ul>
      ${sequences.length > 0
        ? html`
            <h2>Sequences</h2>
            <ul>
              ${sequences.map(
                (reg) => html`
                  <li>
                    <kbd>${reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
                    ${reg.options.meta?.name ? html`<span> — ${reg.options.meta.name}</span>` : ''}
                  </li>
                `,
              )}
            </ul>
          `
        : ''}
    `
  }
}
```

The controller exposes `hotkeys` and `sequences` arrays. The `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.
