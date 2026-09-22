# Hotkeys — Automatic cleanup

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Automatic cleanup

The hook automatically unregisters the hotkey when the component unmounts:

```tsx
function TemporaryPanel() {
  // Automatically cleaned up when this component unmounts
  useHotkey('Escape', () => closePanel())

  return <div>Panel content</div>
}
```
