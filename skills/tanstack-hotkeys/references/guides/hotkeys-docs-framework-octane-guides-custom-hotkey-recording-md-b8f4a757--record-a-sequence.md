# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

```tsx
function SequenceRecorder() @{
  const formatForDisplay = useFormatForDisplay()
  const recorder = useHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  <button onClick={recorder.startRecording}>
    {recorder.isRecording
      ? formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
      : recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'}
  </button>
}
```

If the user commits after a single chord, `useHotkeyRecorder` simplifies it to a chord string rather than a 1-element array. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey` (`HotkeyChord | HotkeySequence`). See [Sequences](./hotkeys-docs-framework-octane-guides-sequences-md-dc8f8bbf.md#source-hotkeys-docs-framework-octane-guides-sequences-md) for how sequence bindings work.
