# Hotkeys — Introspecting registrations

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Introspecting registrations

Use the `createHotkeyRegistrations` primitive to get a live view of every registration, chords and sequences together. It's the building block for shortcut palettes and help dialogs.

```tsx
import { For, Show } from 'solid-js'
import { createHotkeyRegistrations, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutPalette() {
  const registrations = createHotkeyRegistrations()

  return (
    <ul>
      <For each={registrations()}>
        {(reg) => (
          <li>
            <kbd>{formatForDisplay(reg.hotkey)}</kbd>
            {reg.options.meta?.name && <span> — {reg.options.meta.name}</span>}
            <Show when={reg.kind === 'sequence' && reg}>
              {(seq) => <small>{seq().matchedStepCount}/{seq().hotkey.length} steps</small>}
            </Show>
          </li>
        )}
      </For>
    </ul>
  )
}
```

The returned accessor yields one array of registration views. Each view has an `id`, the `hotkey`, its `options` (including `meta`), its `target`, and a `triggerCount`. Narrow with `kind`: chord views add `parsedHotkey`; sequence views add `parsedSequence` and `matchedStepCount`, the steps matched so far in the current attempt. Disabled entries stay listed; unmounted registrations disappear. Format any hotkey with `formatForDisplay`, and group entries by `options.meta?.group` when building a help panel.

Registrations only exist while their components are mounted. To list hotkeys from routes that have not rendered, declare them with [app hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md).
