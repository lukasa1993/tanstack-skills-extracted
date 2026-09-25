# Hotkeys — Multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Multiple hotkeys

Register as many hotkeys as you need. Each `@hotkey` decorator is independent:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() { saveDocument() }

  @hotkey('Mod+Z')
  undo() { undoAction() }

  @hotkey('Mod+Shift+Z')
  redo() { redoAction() }

  @hotkey('Mod+F')
  search() { openSearch() }

  @hotkey('Escape')
  dismiss() { closeDialog() }
}
```
