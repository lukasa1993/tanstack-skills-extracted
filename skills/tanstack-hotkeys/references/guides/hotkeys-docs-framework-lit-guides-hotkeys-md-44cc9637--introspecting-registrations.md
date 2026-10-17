# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Introspecting registrations

Use the `HotkeyRegistrationsController` controller to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRegistrationsController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-palette')
class ShortcutPalette extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    return html`<ul>
      ${this.registrations.hotkeys.map(
        (reg) => html`
          <li>
            <kbd>${formatForDisplay(reg.hotkey)}</kbd>
            ${reg.options.meta?.name ? html`<span> — ${reg.options.meta.name}</span>` : ''}
            ${reg.kind === 'sequence'
              ? html`<small>${reg.matchedStepCount}/${reg.hotkey.length} steps</small>`
              : ''}
          </li>
        `,
      )}
    </ul>`
  }
}
```

The controller's `hotkeys` getter holds one array of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md).
