# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Build a shortcut settings screen

For an app-wide settings screen, declare your hotkeys as [app hotkeys](./hotkeys-docs-framework-svelte-guides-app-hotkeys-md-bdf9b10d.md#source-hotkeys-docs-framework-svelte-guides-app-hotkeys-md), and save each recording with `setCustomHotkey`. That keeps cheat sheets, conflict checks, and saved choices in one place. [Change hotkeys](./hotkeys-docs-framework-svelte-guides-app-hotkeys-md-bdf9b10d.md#source-hotkeys-docs-framework-svelte-guides-app-hotkeys-md) shows a settings row built that way.

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
