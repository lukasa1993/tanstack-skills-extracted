# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./hotkeys-docs-framework-svelte-guides-app-hotkeys-md-bdf9b10d.md#source-hotkeys-docs-framework-svelte-guides-app-hotkeys-md) with `setCustomHotkey` so cheat sheets, persistence, and conflict checks for unmounted routes stay in one place.

For a few hotkeys in one component, `$state` is enough:

```svelte
<script lang="ts">
  import {
    createHotkeyRecorder,
    createHotkeys,
    getFormatForDisplay,
  } from '@tanstack/svelte-hotkeys'
  import type { Hotkey } from '@tanstack/svelte-hotkeys'

  const actions = { save, undo, search }
  type Action = keyof typeof actions

  const formatForDisplay = getFormatForDisplay()
  let shortcuts = $state<Record<Action, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: ['G', 'S'],
  })
  let editing = $state<Action | null>(null)

  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => {
      if (editing) shortcuts = { ...shortcuts, [editing]: hotkey }
      editing = null
    },
    onCancel: () => (editing = null),
  })

  // Register each action with its current hotkey
  createHotkeys(() =>
    Object.entries(shortcuts).map(([action, hotkey]) => ({
      hotkey,
      callback: actions[action as Action],
    })),
  )
</script>

<div>
  {#each Object.entries(shortcuts) as [action, hotkey] (action)}
    <button
      onclick={() => {
        editing = action as Action
        recorder.startRecording()
      }}
    >
      {action}:
      {editing === action && recorder.isRecording ? 'Press keys...' : formatForDisplay(hotkey)}
    </button>
  {/each}
</div>
```
