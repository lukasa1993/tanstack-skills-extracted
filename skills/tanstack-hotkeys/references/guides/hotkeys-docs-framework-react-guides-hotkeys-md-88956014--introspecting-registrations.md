# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Introspecting registrations

Use the `useHotkeyRegistrations` hook to get a live view of all hotkey and sequence registrations. It's the building block for shortcut palettes and help dialogs.

```tsx
import { useHotkeyRegistrations, formatForDisplay } from '@tanstack/react-hotkeys'

function ShortcutPalette() {
  const { hotkeys, sequences } = useHotkeyRegistrations()

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <ul>
        {hotkeys.map((reg) => (
          <li key={reg.id}>
            <kbd>{formatForDisplay(reg.hotkey)}</kbd>
            {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
            {reg.options.meta?.description && <p>{reg.options.meta.description}</p>}
          </li>
        ))}
      </ul>
      {sequences.length > 0 && (
        <>
          <h2>Sequences</h2>
          <ul>
            {sequences.map((reg) => (
              <li key={reg.id}>
                <kbd>{reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
                {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
```

The returned `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.
