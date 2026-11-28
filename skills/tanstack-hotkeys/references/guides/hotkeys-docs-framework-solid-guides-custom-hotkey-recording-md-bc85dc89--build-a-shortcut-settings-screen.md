# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md) with `setCustomHotkey` so cheat sheets, persistence, and unmounted-route conflict checks stay unified.

For a few hotkeys in one component, signals are enough:

```tsx
import { For, createSignal } from 'solid-js'
import {
  createFormatForDisplay,
  createHotkeyRecorder,
  createHotkeys,
} from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() {
  const formatForDisplay = createFormatForDisplay()
  const [shortcuts, setShortcuts] = createSignal<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  const [editing, setEditing] = createSignal<Action | null>(null)

  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      const action = editing()
      if (action) setShortcuts((prev) => ({ ...prev, [action]: hotkey }))
      setEditing(null)
    },
    onCancel: () => setEditing(null),
  })

  // Register each action with its current hotkey
  createHotkeys(() =>
    Object.entries(shortcuts()).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )

  return (
    <div>
      <For each={Object.entries(shortcuts())}>
        {([action, hotkey]) => (
          <button
            onClick={() => {
              setEditing(action as Action)
              recorder.startRecording()
            }}
          >
            {action}:{' '}
            {editing() === action && recorder.isRecording()
              ? 'Press keys...'
              : formatForDisplay(hotkey)}
          </button>
        )}
      </For>
    </div>
  )
}
```
