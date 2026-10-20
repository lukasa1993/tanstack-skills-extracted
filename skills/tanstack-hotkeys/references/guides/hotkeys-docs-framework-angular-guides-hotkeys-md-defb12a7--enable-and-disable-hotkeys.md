# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Enable and disable hotkeys

A hotkey is on while its component exists. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```ts
import { Component, output } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-settings-dialog',
  template: `<div role="dialog">...</div>`,
})
export class SettingsDialogComponent {
  readonly closed = output()

  constructor() {
    // Registered only while the dialog exists
    injectHotkey('Escape', () => this.closed.emit())
  }
}
```

For a condition that doesn't match a component, pass `enabled` from a function:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
}))
```

A disabled hotkey stays registered, so devtools still list it, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the callback:

```ts
injectHotkey('Mod+S', () => {
  if (!this.hasUnsavedChanges()) return
  this.save()
})
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, use [scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays rendered, or suspend the rest of the page while a dialog is open.
