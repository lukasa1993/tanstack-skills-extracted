# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```ts
Alpine.data('sequenceRecorder', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()
  const recorder = createHotkeyRecorder(hotkeys, {
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  return {
    recorder,
    get label() {
      if (recorder.isRecording) {
        return formatForDisplay(recorder.steps) || 'Press chords, then Enter...'
      }
      return recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

A one-step recording commits as a chord, so the result can always go straight to `createHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./hotkeys-docs-framework-alpine-guides-sequences-md-037f4bfb.md#source-hotkeys-docs-framework-alpine-guides-sequences-md) for how sequences match.

Options can also be a getter, such as `createHotkeyRecorder(this.hotkeys, () => ({ maxSteps: Infinity, recordBy: this.mode, onRecord }))`, so the recorder follows Alpine state.
