# Formatting Display — Label physical keys for the user's keyboard

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Label physical keys for the user's keyboard

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `FormatForDisplayController` follow the user's keyboard where the browser reports its layout:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { FormatForDisplayController } from '@tanstack/lit-hotkeys'

@customElement('move-up')
class MoveUp extends LitElement {
  private formatForDisplay = new FormatForDisplayController(this)

  render() {
    // 'W' on QWERTY, 'Z' on AZERTY
    return html`<kbd>${this.formatForDisplay.format('[KeyW]')}</kbd>`
  }
}
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads when the first element with a controller connects.** The first render shows the fallback label, and so does server HTML. The label updates when the layout arrives. Later elements get it right after their first render, before the browser paints.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **The layout is read again when the window regains focus**, because browsers send no event when the user switches layouts. This stops when no element with a controller is connected.

A `KeyboardLayoutController` has the loaded layout, or `null`, as its `value`, for labels you draw yourself, such as an on-screen keyboard. It maps each code to the character the key types without modifiers, such as `KeyQ` to `a`.

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the controller's options. Lit has no provider, so set it on each controller:

```ts
private formatForDisplay = new FormatForDisplayController(this, {
  keyboardLayout: false,
})
```

A `KeyboardLayoutController` always loads the layout, so don't create one either.

### Supply your own layout

Pass the same kind of map as `layoutMap`, for a layout your app already knows, such as one the user picked in settings:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works. A `layoutMap` you pass wins over the loaded layout.

Use `keyLabels` for your own labels, keyed by physical code or by key name:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only. `keyLabels` works anywhere, including on the server.
