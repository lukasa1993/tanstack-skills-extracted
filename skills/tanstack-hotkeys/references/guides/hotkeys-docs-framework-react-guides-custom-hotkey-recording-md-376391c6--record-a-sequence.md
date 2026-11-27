# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-custom-hotkey-recording-md-376391c6.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

```tsx
function SequenceRecorder() {
  const formatForDisplay = useFormatForDisplay()
  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  return (
    <button onClick={recorder.isRecording ? recorder.cancelRecording : recorder.startRecording}>
      {recorder.isRecording
        ? formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
        : recorder.recordedHotkey
          ? formatForDisplay(recorder.recordedHotkey)
          : 'Click to record'}
    </button>
  )
}
```

If the user commits after a single chord, `useHotkeyRecorder` simplifies it to a chord string rather than a 1-element array. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey` (`HotkeyChord | HotkeySequence`). See [Sequences](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md) for how sequence bindings work.
