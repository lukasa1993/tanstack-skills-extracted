# Hotkeys — Basic usage

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Basic usage

### The `@hotkey` decorator

Decorate any method to have it called when a hotkey is pressed:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {
    saveDocument()
  }

  render() {
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
@hotkey('Mod+S')
save(event: KeyboardEvent, context: HotkeyCallbackContext) {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
}
```

### The `HotkeyController`

For cases where you need to construct the hotkey dynamically or pass a callback that isn't a class method, use `HotkeyController` directly:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  private saveHotkey = new HotkeyController(
    this,
    'Mod+S',
    () => this.save(),
  )

  constructor() {
    super()
    this.addController(this.saveHotkey)
  }

  private save() {
    saveDocument()
  }

  render() {
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

### Changing a binding

Pass a new logical or physical binding through your framework's normal state mechanism. A recorder result such as `Alt+[KeyS]` can be passed directly to the same registration API. Keep an initial binding in application state if you want a reset button; the library does not need a separate preferences store.
