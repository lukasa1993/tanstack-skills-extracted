# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md) shows a settings row built that way.

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
