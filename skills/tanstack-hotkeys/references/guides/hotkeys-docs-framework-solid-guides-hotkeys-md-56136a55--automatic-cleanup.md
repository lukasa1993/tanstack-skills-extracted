# Hotkeys — Automatic cleanup

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Automatic cleanup

The primitive automatically unregisters the hotkey when the component unmounts (when the owning reactive scope is disposed):

```tsx
function TemporaryPanel() {
  createHotkey('Escape', () => closePanel())
  return <div>Panel content</div>
}
```
