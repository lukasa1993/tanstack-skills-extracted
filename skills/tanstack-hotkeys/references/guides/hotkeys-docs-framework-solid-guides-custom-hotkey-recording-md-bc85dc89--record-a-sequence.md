# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```tsx
function SequenceRecorder() {
  const formatForDisplay = createFormatForDisplay()
  const recorder = createHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  const label = () => {
    if (recorder.isRecording()) {
      return formatForDisplay(recorder.steps()) || 'Press chords, then Enter...'
    }
    const hotkey = recorder.recordedHotkey()
    return hotkey ? formatForDisplay(hotkey) : 'Click to record'
  }

  return <button onClick={recorder.startRecording}>{label()}</button>
}
```

A one-step recording commits as a chord, so the result can always go straight to `createHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./hotkeys-docs-framework-solid-guides-sequences-md-ea3dff4a.md#source-hotkeys-docs-framework-solid-guides-sequences-md) for how sequences match.

Options can also be an accessor, such as `createHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: mode(), onRecord }))`, so the recorder follows signals.
