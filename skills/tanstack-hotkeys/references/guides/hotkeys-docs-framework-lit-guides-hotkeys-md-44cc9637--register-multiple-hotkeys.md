# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

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
