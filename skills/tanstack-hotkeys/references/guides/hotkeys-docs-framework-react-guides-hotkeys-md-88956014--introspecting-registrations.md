# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Introspecting registrations

Use the `useHotkeyRegistrations` hook to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```tsx
import { useHotkeyRegistrations, formatForDisplay } from '@tanstack/react-hotkeys'

function ShortcutPalette() {
  const registrations = useHotkeyRegistrations()

  return (
    <ul>
      {registrations.map((reg) => (
        <li key={reg.id}>
          <kbd>{formatForDisplay(reg.hotkey)}</kbd>
          {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
          {reg.kind === 'sequence' && (
            <small>
              {reg.matchedStepCount}/{reg.hotkey.length} steps
            </small>
          )}
        </li>
      ))}
    </ul>
  )
}
```

Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md).
