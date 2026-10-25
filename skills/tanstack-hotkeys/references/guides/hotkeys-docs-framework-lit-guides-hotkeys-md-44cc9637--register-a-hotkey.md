# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Register a hotkey

Decorate the method that handles the hotkey with `@hotkey`:

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
    return html`<textarea></textarea>`
  }
}
```

The method receives the `KeyboardEvent` and a context object. Type the context to match the hotkey, `HotkeyChordCallbackContext` for a chord:

```ts
@hotkey('Mod+S')
save(event: KeyboardEvent, context: HotkeyChordCallbackContext) {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
}
```

The method runs with the element as `this`, so it reads the element's current properties.

Decorator arguments are fixed when the class is defined. When the hotkey or its options change, use `HotkeyController` and pass them as functions. The controller reads them when the element connects and after each update. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @property({ attribute: false }) saveHotkey: Hotkey = 'Mod+S'
  @property({ type: Boolean }) readOnly = false

  constructor() {
    super()
    this.addController(
      new HotkeyController(
        this,
        () => this.saveHotkey,
        () => this.save(),
        () => ({ enabled: !this.readOnly }),
      ),
    )
  }

  save() {
    saveDocument()
  }

  render() {
    return html`<textarea></textarea>`
  }
}
```

Keep the values the functions read in reactive properties, so a change triggers an update. A controller callback receives `HotkeyCallbackContext`, which can belong to either kind of hotkey, so check `context.kind` before reading `context.parsedChord`.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md#source-hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
@hotkey('Escape')
close() {}

@hotkey('Mod+S') // Command+S on macOS, Control+S elsewhere
save() {}

@hotkey('Mod+Alt+Shift+K') // Modifiers in order: Mod or Control, Alt, Shift, Meta
openCommandLog() {}

@hotkey('[KeyW]') // The W position, whatever the layout types there
moveUp() {}

@hotkey('Shift+Mod+S') // Type error: Mod comes first
saveAs() {}
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
@hotkey({ key: 'S', mod: true, shift: true }) // Same as 'Mod+Shift+S'
saveAs() {}

@hotkey({ code: 'KeyW' }) // Same as '[KeyW]'
moveUp() {}

constructor() {
  super()
  this.addController(
    new HotkeyController(
      this,
      () => ({ key: this.binding.key, mod: this.binding.mod, shift: this.binding.shift }),
      () => this.runAction(),
    ),
  )
}
```

Sequence steps can be strings, objects, or a mix:

```ts
@hotkey(['G', { key: 'H', shift: true }])
goToHistory() {}
```

Every chord and sequence step registers as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
