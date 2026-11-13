# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md) shows a settings row built that way.

For a few hotkeys in one component, state is enough:

```tsx
import { useState } from 'octane'
import {
  useFormatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/octane-hotkeys'
import type { Hotkey } from '@tanstack/octane-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

function ShortcutSettings() @{
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

  <div>
    @for (const [action, hotkey] of Object.entries(shortcuts); key action) {
      <button
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
    }
  </div>
}
```
