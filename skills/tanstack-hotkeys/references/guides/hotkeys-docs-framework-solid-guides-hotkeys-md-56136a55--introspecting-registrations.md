# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Introspecting registrations

Use the `createHotkeyRegistrations` primitive to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```tsx
import { createHotkeyRegistrations, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutPalette() {
  const registrations = createHotkeyRegistrations()

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <ul>
        <For each={registrations().hotkeys}>
          {(reg) => (
            <li>
              <kbd>{formatForDisplay(reg.hotkey)}</kbd>
              {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
              {reg.options.meta?.description && <p>{reg.options.meta.description}</p>}
            </li>
          )}
        </For>
      </ul>
      <Show when={registrations().sequences.length > 0}>
        <h2>Sequences</h2>
        <ul>
          <For each={registrations().sequences}>
            {(reg) => (
              <li>
                <kbd>{reg.sequence.map((step) => formatForDisplay(step)).join(' → ')}</kbd>
                {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
```

The returned accessor yields an object with a `hotkeys` array and a `sequences` array. Each hotkey entry carries the hotkey string, its options (including `meta`), and its enabled state; sequence entries have the same structure.
