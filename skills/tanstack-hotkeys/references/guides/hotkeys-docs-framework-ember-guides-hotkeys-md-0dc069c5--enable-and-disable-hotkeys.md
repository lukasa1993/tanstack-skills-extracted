# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Enable and disable hotkeys

A hotkey is on while its helper is rendered. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```gts
import Component from '@glimmer/component'
import { useHotkey } from '@tanstack/ember-hotkeys'

interface SettingsDialogSignature {
  Args: { onClose: () => void }
}

export default class SettingsDialog extends Component<SettingsDialogSignature> {
  <template>
    {{! Registered only while the dialog is rendered }}
    {{useHotkey 'Escape' @onClose}}
    <div role="dialog">...</div>
  </template>
}
```

For a condition that doesn't match a component, pass `enabled` from a tracked value:

```hbs
{{useHotkey 'Mod+S' this.save enabled=this.hasUnsavedChanges}}
```

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the callback:

```ts
save = () => {
  if (!this.hasUnsavedChanges) return
  saveDocument()
}
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays rendered, or suspend the rest of the page while a dialog is open. See [Add defaults and scopes](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md).
