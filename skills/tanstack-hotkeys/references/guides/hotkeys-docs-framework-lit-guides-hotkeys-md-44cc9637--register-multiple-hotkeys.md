# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Register multiple hotkeys

Decorate one method for each hotkey. Each decorator registers its own hotkey:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {}

  @hotkey('Mod+Z')
  undo() {}

  @hotkey('Mod+Shift+Z')
  redo() {}

  @hotkey(['G', 'G'], { timeout: 500 })
  scrollToTop() {}
}
```

Chords and sequences can sit side by side on the same element.

### Share options

Keep options that several hotkeys share in one object. Pass it to each hotkey, or spread it to add more options:

```ts
import type { HotkeyControllerChordOptions } from '@tanstack/lit-hotkeys'

// The formatting hotkeys toggle, so each fires once per press
const toggle: HotkeyControllerChordOptions = { requireReset: true }

@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+B', toggle)
  toggleBold() {}

  @hotkey('Mod+I', toggle)
  toggleItalic() {}

  @hotkey('Mod+U', { ...toggle, meta: { name: 'Underline' } })
  toggleUnderline() {}
}
```

### Build the list from data

Each decorator and controller registers one hotkey, and Lit has no API for a list whose length changes. When the list is known when the element is created, create one `HotkeyController` for each item in the constructor.

To add an item later, create its controller then. It registers right away while the element is connected. To remove an item, call its controller's `dispose()`, which unregisters the hotkey and removes the controller from the element. Lit's `removeController` alone leaves the hotkey registered, even after the element disconnects:

```ts
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

@customElement('tool-palette')
class ToolPalette extends LitElement {
  private tools = new Map<string, HotkeyController>()

  addTool(id: string, hotkey: Hotkey, run: () => void) {
    this.removeTool(id)
    this.tools.set(id, new HotkeyController(this, hotkey, run))
  }

  removeTool(id: string) {
    this.tools.get(id)?.dispose()
    this.tools.delete(id)
  }
}
```

The other Lit controllers, such as `HotkeyHintController` and `HotkeyRecorderController`, have `dispose()` too.
