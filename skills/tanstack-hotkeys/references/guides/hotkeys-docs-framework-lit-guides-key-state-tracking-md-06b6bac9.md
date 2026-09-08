# Key State Tracking

<a id="source-hotkeys-docs-framework-lit-guides-key-state-tracking-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.8.0`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys provides three Lit **reactive controllers** for tracking the real-time state of keyboard keys. These are useful for building UIs that respond to modifier keys being held, displaying active key states, or implementing hold-to-activate features.

## `HeldKeysController`

Tracks all currently held key names. Exposes a reactive **`value`** getter: `Array<string>`.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HeldKeysController } from '@tanstack/lit-hotkeys'

@customElement('key-display')
class KeyDisplay extends LitElement {
  private heldKeys = new HeldKeysController(this)

  render() {
    const keys = this.heldKeys.value
    return html`
      <div>
        ${keys.length > 0 ? `Held: ${keys.join(' + ')}` : 'No keys held'}
      </div>
    `
  }
}
```

The array contains key names like `'Shift'`, `'Control'`, `'Meta'`, `'A'`, `'ArrowUp'`, etc. Keys appear in the order they were pressed.

## `HeldKeyCodesController`

Tracks held key names mapped to physical key codes (`event.code`). Exposes **`value`**: `Record<string, string>`.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HeldKeyCodesController } from '@tanstack/lit-hotkeys'

@customElement('key-code-display')
class KeyCodeDisplay extends LitElement {
  private heldKeyCodes = new HeldKeyCodesController(this)

  render() {
    const codes = this.heldKeyCodes.value
    // Example: { Shift: "ShiftLeft", Control: "ControlRight" }
    return html`
      <div>
        ${Object.entries(codes).map(
          ([key, code]) => html`<div>${key}: ${code}</div>`,
        )}
      </div>
    `
  }
}
```

Use this when you need to distinguish left vs. right modifiers (or other physical keys).

## `KeyHoldController`

Tracks whether **one** specific key is held. Exposes **`value`**: `boolean`. Updates the host only when **that** key’s held state changes (not on every unrelated key press).

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('modifier-indicators')
class ModifierIndicators extends LitElement {
  private shift = new KeyHoldController(this, 'Shift')
  private ctrl = new KeyHoldController(this, 'Control')
  private alt = new KeyHoldController(this, 'Alt')
  private meta = new KeyHoldController(this, 'Meta')

  render() {
    return html`
      <div class="modifier-bar">
        <span class=${this.shift.value ? 'active' : ''}>Shift</span>
        <span class=${this.ctrl.value ? 'active' : ''}>Ctrl</span>
        <span class=${this.alt.value ? 'active' : ''}>Alt</span>
        <span class=${this.meta.value ? 'active' : ''}>Meta</span>
      </div>
    `
  }
}
```

## Common patterns

### Hold-to-reveal UI

Show extra actions while Shift is held:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('file-item')
class FileItem extends LitElement {
  @property({ type: String }) fileName = ''

  private shift = new KeyHoldController(this, 'Shift')

  render() {
    return html`
      <div class="file-item">
        <span>${this.fileName}</span>
        ${this.shift.value
          ? html`<button class="danger" @click=${this._permanentDelete}>
              Permanently Delete
            </button>`
          : html`<button @click=${this._moveToTrash}>Move to Trash</button>`}
      </div>
    `
  }

  private _permanentDelete = () => {
    /* permanentlyDelete(file) */
  }
  private _moveToTrash = () => {
    /* moveToTrash(file) */
  }
}
```

### Keyboard shortcut hints

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('shortcut-hints')
class ShortcutHints extends LitElement {
  private mod = new KeyHoldController(this, 'Meta') // use 'Control' on Windows if you prefer

  render() {
    if (!this.mod.value) return html``
    return html`
      <div class="shortcut-overlay">
        <div>S - Save</div>
        <div>Z - Undo</div>
        <div>Shift+Z - Redo</div>
        <div>K - Command Palette</div>
      </div>
    `
  }
}
```

### Debugging key display

Combine controllers with [`formatForDisplay`](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md#source-hotkeys-docs-framework-lit-guides-formatting-display-md) for readable labels:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  HeldKeysController,
  HeldKeyCodesController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { RegisterableHotkey } from '@tanstack/lit-hotkeys'

@customElement('key-debugger')
class KeyDebugger extends LitElement {
  private heldKeys = new HeldKeysController(this)
  private heldCodes = new HeldKeyCodesController(this)

  render() {
    const keys = this.heldKeys.value
    const codes = this.heldCodes.value
    return html`
      <div class="key-debugger">
        <h3>Active Keys</h3>
        ${keys.map(
          (key) => html`
            <div>
              <strong>
                ${formatForDisplay(key as RegisterableHotkey, {
                  useSymbols: true,
                })}
              </strong>
              <span class="code">${codes[key] ?? ''}</span>
            </div>
          `,
        )}
        ${keys.length === 0 ? html`<p>Press any key...</p>` : ''}
      </div>
    `
  }
}
```

## Platform quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

### macOS modifier key behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event for the non-modifier key. TanStack Hotkeys detects and handles this automatically so held key state stays accurate.

### Window blur

When the browser window loses focus, all held keys are automatically cleared. This prevents “stuck” keys after the user tabs away and releases keys outside the window.

## Under the hood

The three controllers subscribe to the singleton `KeyStateTracker` store from `@tanstack/hotkeys`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store, which the controllers read reactively.

```ts
import { getKeyStateTracker } from '@tanstack/lit-hotkeys'

const tracker = getKeyStateTracker()

tracker.getHeldKeys() // string[]
tracker.store.state.heldCodes // Record<string, string>
tracker.isKeyHeld('Shift') // boolean
tracker.isAnyKeyHeld(['Shift', 'Control']) // boolean
tracker.areAllKeysHeld(['Shift', 'Control']) // boolean
```
