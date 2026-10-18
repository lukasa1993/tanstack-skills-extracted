# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Enable and disable hotkeys

A hotkey is on while its component is mounted. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```tsx
function SettingsDialog(props: { onClose: () => void }) {
  // Registered only while the dialog is mounted
  createHotkey('Escape', () => props.onClose())

  return <div role="dialog">...</div>
}
```

For a condition that doesn't match a component, pass `enabled` from an accessor:

```tsx
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges() }))
```

A disabled hotkey stays registered, so devtools still list it, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the callback:

```tsx
createHotkey('Mod+S', () => {
  if (!hasUnsavedChanges()) return
  save()
})
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, use [scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays mounted, or suspend the rest of the page while a dialog is open.
