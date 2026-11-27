# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

```vue
<script setup lang="ts">
import { useFormatForDisplay, useHotkeyRecorder } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
const { isRecording, steps, recordedHotkey, startRecording } = useHotkeyRecorder({
  maxSteps: Infinity,
  onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
})
</script>

<template>
  <button @click="startRecording">
    {{
      isRecording
        ? formatForDisplay(steps) || 'Press chords, then Enter...'
        : recordedHotkey
          ? formatForDisplay(recordedHotkey)
          : 'Click to record'
    }}
  </button>
</template>
```

If the user commits after a single chord, `useHotkeyRecorder` simplifies it to a chord string instead of a one-element array, so the result can always go straight to `useHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which is a chord or a sequence. See [Sequences](./hotkeys-docs-framework-vue-guides-sequences-md-9eb4426e.md#source-hotkeys-docs-framework-vue-guides-sequences-md) for how sequences match.

Options can also be a ref or getter, such as `useHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: mode.value, onRecord }))`, so the recorder follows reactive state.
