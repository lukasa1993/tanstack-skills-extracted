# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Enable and disable hotkeys

A hotkey is on while its element is connected. Most hotkeys need no other on and off logic, so put each one on the element it belongs to:

```ts
@customElement('settings-dialog')
class SettingsDialog extends LitElement {
  // Registered only while the dialog is connected
  @hotkey('Escape')
  close() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    return html`<div role="dialog">...</div>`
  }
}
```

For a condition that doesn't match an element, pass `enabled` from a `HotkeyController` options function:

```ts
constructor() {
  super()
  this.addController(
    new HotkeyController(this, 'Mod+S', () => this.save(), () => ({
      enabled: this.hasUnsavedChanges,
    })),
  )
}
```

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the method:

```ts
@hotkey('Mod+S')
save() {
  if (!this.hasUnsavedChanges) return
  saveDocument()
}
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays connected, or suspend the rest of the page while a dialog is open. See [Add scopes](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md).
