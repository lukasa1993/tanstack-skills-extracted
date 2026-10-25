# Held Key State Helpers

<a id="source-hotkeys-docs-framework-lit-guides-held-key-state-helpers-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

These controllers report which keys the user is holding right now. They're optional helpers for your UI: show which modifiers are down, or change a button while Shift is held. You don't need them to register hotkeys. To show a button's shortcut while the user holds its modifiers, see [Hotkey Hints](./hotkeys-docs-framework-lit-guides-hotkey-hints-md-581ca99a.md#source-hotkeys-docs-framework-lit-guides-hotkey-hints-md).

Each controller adds itself to the element, requests an update when its value changes, and holds the current state in `value`.

## Show which keys are held

`HeldKeysController` holds the held keys in the order they were pressed, such as `['Control', 'Shift', 'A']`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HeldKeysController } from '@tanstack/lit-hotkeys'

@customElement('key-display')
class KeyDisplay extends LitElement {
  private heldKeys = new HeldKeysController(this)

  render() {
    const keys = this.heldKeys.value
    return html`<div>${keys.length > 0 ? `Held: ${keys.join(' + ')}` : 'No keys held'}</div>`
  }
}
```

## Check whether a key is held

`KeyHoldController` tracks whether one key is held. It updates the element only when that key is pressed or released:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('file-item')
class FileItem extends LitElement {
  @property({ attribute: false }) file!: File
  private shift = new KeyHoldController(this, 'Shift')

  render() {
    return html`
      <span>${this.file.name}</span>
      ${this.shift.value
        ? html`<button @click=${() => permanentlyDelete(this.file)}>Delete permanently</button>`
        : html`<button @click=${() => moveToTrash(this.file)}>Move to trash</button>`}
    `
  }
}
```

## Tell left and right modifiers apart

`HeldKeyCodesController` maps each held key to the physical key that's down, from `event.code`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HeldKeyCodesController } from '@tanstack/lit-hotkeys'

@customElement('modifier-sides')
class ModifierSides extends LitElement {
  private heldCodes = new HeldKeyCodesController(this) // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }

  render() {
    return this.heldCodes.value.Shift === 'ShiftRight'
      ? html`<p>Right Shift is held</p>`
      : ''
  }
}
```

## Read held keys in an event handler

To read the held keys in an event handler without updating the element, use the shared tracker from `getKeyStateTracker`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { getKeyStateTracker } from '@tanstack/lit-hotkeys'

@customElement('my-canvas')
class MyCanvas extends LitElement {
  private tracker = getKeyStateTracker()

  private onClick() {
    if (this.tracker.isKeyHeld('Space')) startPanning()
    else if (this.tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }

  render() {
    return html`<canvas @click=${this.onClick}></canvas>`
  }
}
```

The tracker starts listening the first time you get it, so get it when the element is created, before the user presses the keys you care about. Call its methods inside the handler to read the state at that moment. It also has `getHeldKeys()` and `areAllKeysHeld(keys)`. Don't destroy the tracker when an element disconnects, because every controller shares it.

For a mouse or wheel event, `event.ctrlKey`, `shiftKey`, `altKey`, and `metaKey` already report the modifiers. Browsers also set `ctrlKey` for a trackpad pinch, so it doesn't always mean Control is held.

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. [Held keys reset when the window loses focus](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) covers the cases the tracker handles.

The [held-keys example](https://github.com/TanStack/hotkeys/tree/41f06c51a38fac64409a3d4932cc8958f558ae57/examples/lit/held-keys) shows held keys and their codes, and the [key-hold example](https://github.com/TanStack/hotkeys/tree/41f06c51a38fac64409a3d4932cc8958f558ae57/examples/lit/key-hold) shows modifier indicators.
