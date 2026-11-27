# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-custom-hotkey-recording-md-376391c6.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md) with `setCustomHotkey` so cheat sheets, persistence, and unmounted-route conflict checks stay unified.

For local shortcuts inside a single component, React state is enough:

```tsx
import { useState } from 'react'
import {
  useFormatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/react-hotkeys'
import type { Hotkey } from '@tanstack/react-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() {
  const formatForDisplay = useFormatForDisplay()
  const [shortcuts, setShortcuts] = useState<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  const [editing, setEditing] = useState<Action | null>(null)

  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (editing) setShortcuts((prev) => ({ ...prev, [editing]: hotkey }))
      setEditing(null)
    },
    onCancel: () => setEditing(null),
  })

  // Register each action with its current hotkey
  useHotkeys(
    Object.entries(shortcuts).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )

  return (
    <div>
      {Object.entries(shortcuts).map(([action, hotkey]) => (
        <button
          key={action}
          onClick={() => {
            setEditing(action as Action)
            recorder.startRecording()
          }}
        >
          {action}:{' '}
          {editing === action && recorder.isRecording
            ? 'Press keys...'
            : formatForDisplay(hotkey)}
        </button>
      ))}
    </div>
  )
}
```
