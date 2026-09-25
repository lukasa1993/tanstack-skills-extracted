# Hotkeys — Automatic cleanup

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Automatic cleanup

Both the `@hotkey` decorator and `HotkeyController` automatically unregister the hotkey when the element is disconnected from the DOM:

```ts
@customElement('temporary-panel')
class TemporaryPanel extends LitElement {
  // Automatically registered on connect, unregistered on disconnect
  @hotkey('Escape')
  close() { this.remove() }

  render() {
    return html`<div>Panel content</div>`
  }
}
```
