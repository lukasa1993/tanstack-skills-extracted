# Custom Hotkey Recording — Build a shortcut settings screen

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Build a shortcut settings screen

For app-wide settings, pair [App Hotkeys](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md) with `setCustomHotkey` so cheat sheets, persistence, and conflict checks for unmounted routes stay in one place.

For a few hotkeys in one component, refs are enough:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  useFormatForDisplay,
  useHotkeyRecorder,
  useHotkeys,
} from '@tanstack/vue-hotkeys'
import type { Hotkey } from '@tanstack/vue-hotkeys'

const actions = { save, undo, search }
type Action = keyof typeof actions

const formatForDisplay = useFormatForDisplay()
const shortcuts = ref<Record<Action, Hotkey>>({
  save: 'Mod+S',
  undo: 'Mod+Z',
  search: ['G', 'S'],
})
const editing = ref<Action | null>(null)

const { isRecording, startRecording } = useHotkeyRecorder({
  maxSteps: Infinity,
  onRecord: (hotkey) => {
    if (editing.value) shortcuts.value = { ...shortcuts.value, [editing.value]: hotkey }
    editing.value = null
  },
  onCancel: () => (editing.value = null),
})

// Register each action with its current hotkey
useHotkeys(() =>
  Object.entries(shortcuts.value).map(([action, hotkey]) => ({
    hotkey,
    callback: actions[action as Action],
  })),
)

function edit(action: Action) {
  editing.value = action
  startRecording()
}
</script>

<template>
  <div>
    <button v-for="(hotkey, action) in shortcuts" :key="action" @click="edit(action)">
      {{ action }}:
      {{ editing === action && isRecording ? 'Press keys...' : formatForDisplay(hotkey) }}
    </button>
  </div>
</template>
```
