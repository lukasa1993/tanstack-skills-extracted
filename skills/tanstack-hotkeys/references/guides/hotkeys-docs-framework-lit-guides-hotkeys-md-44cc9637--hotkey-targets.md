# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. For an element the hotkey's element renders, pass the options as a function on a `HotkeyController`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-panel')
class MyPanel extends LitElement {
  private panel = createRef<HTMLDivElement>()

  constructor() {
    super()
    // Fires only while the panel, or something inside it, has focus
    this.addController(
      new HotkeyController(this, 'Escape', () => this.closePanel(), () => ({
        target: this.panel.value ?? null,
      })),
    )
  }

  render() {
    return html`<div ${ref(this.panel)} tabindex="0">Panel content</div>`
  }
}
```

A `null` target waits until the element renders.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a scope both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both. See [Add scopes](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md).
