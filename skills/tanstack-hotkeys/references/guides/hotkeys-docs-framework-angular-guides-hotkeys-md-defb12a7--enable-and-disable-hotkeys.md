# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

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

Toggling `enabled` keeps the hotkey registered and visible in devtools without registering it again. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
  preventDefault: 'always',
}))
```

See [Hotkeys that can't fire leave the key alone](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

> [!NOTE]
> Single-key shortcuts such as `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). To toggle a group of shortcuts together, use [scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) instead of passing `enabled` to each hotkey.
