# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

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

If the user commits after a single chord, `createHotkeyRecorder` simplifies it to a chord string rather than a 1-element array. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey` (`HotkeyChord | HotkeySequence`). See [Sequences](./hotkeys-docs-framework-solid-guides-sequences-md-ea3dff4a.md#source-hotkeys-docs-framework-solid-guides-sequences-md) for how sequence bindings work.

Options can also be an accessor, such as `createHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: mode(), onRecord }))`, so the recorder follows signals.
