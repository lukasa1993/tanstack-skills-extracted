# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Enable and disable hotkeys

When a shortcut belongs to conditional UI like a modal, keep the hotkey inside that component so rendering and disposal handle registration automatically.

```tsx
function SettingsDialog(props: { onClose: () => void }) {
  // Registered only while the dialog is rendered
  createHotkey('Escape', () => props.onClose())

  return <div role="dialog">...</div>
}
```

For state conditions while the component stays rendered, pass `enabled` from an accessor:

```tsx
createHotkey('Mod+S', () => save(), () => ({ enabled: hasUnsavedChanges() }))
```

Toggling `enabled` keeps the hotkey registered and visible in devtools without re-registering listeners. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```tsx
createHotkey('Mod+S', () => save(), () => ({
  enabled: hasUnsavedChanges(),
  preventDefault: 'always',
}))
```

See [Hotkeys that can't fire leave the key alone](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

When a `<Loading>` boundary shows its fallback again, the content it hid stays mounted, so its hotkeys keep firing. Solid gives the adapter no signal for this. If those hotkeys shouldn't run while the fallback shows, pass `enabled` from the same state that is pending.

> [!NOTE]
> Single-key shortcuts like `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). To toggle a group of shortcuts together, use [scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) instead of passing `enabled` on every call.
