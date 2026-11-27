# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Record a chord

```vue
<script setup lang="ts">
import { useFormatForDisplay, useHotkeyRecorder } from '@tanstack/vue-hotkeys'

const formatForDisplay = useFormatForDisplay()
const { isRecording, recordedHotkey, startRecording, cancelRecording } =
  useHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })
</script>

<template>
  <div>
    <button @click="startRecording">
      {{
        isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'
      }}
    </button>
    <button v-if="isRecording" @click="cancelRecording">Cancel</button>
  </div>
</template>
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings, written like a hand-typed string. Command+S on macOS and Control+S on Windows and Linux both record `Mod+S`. It records what the press typed, such as `?` for Shift+/ and `Mod+1` for AZERTY Ctrl+&. For the few presses whose character the browser reports differently by platform, it falls back to physical bracketed codes, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full rules. Set `recordBy: 'code'` to always record the physical key, or `recordBy: 'key'` to always record the typed character. Pass the result straight to `useHotkey`, and label it with `useFormatForDisplay`.

The composable returns the recorder's state and controls. State members are readonly refs, so destructure them at the top level of `<script setup>` for templates to unwrap them, or read `.value`:

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is currently listening |
| `steps` | Chords captured so far during a sequence recording |
| `recordedHotkey` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |
