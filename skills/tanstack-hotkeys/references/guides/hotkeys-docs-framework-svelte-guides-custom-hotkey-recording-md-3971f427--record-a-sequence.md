# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```svelte
<script lang="ts">
  import { createHotkeyRecorder, getFormatForDisplay } from '@tanstack/svelte-hotkeys'

  const formatForDisplay = getFormatForDisplay()
  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })
</script>

<button onclick={recorder.startRecording}>
  {recorder.isRecording
    ? formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
    : recorder.recordedHotkey
      ? formatForDisplay(recorder.recordedHotkey)
      : 'Click to record'}
</button>
```

A one-step recording commits as a chord, so the result can always go straight to `createHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./hotkeys-docs-framework-svelte-guides-sequences-md-05bb86f7.md#source-hotkeys-docs-framework-svelte-guides-sequences-md) for how sequences match.

Options can also be a getter, such as `createHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: mode, onRecord }))`, so the recorder follows `$state`.
