# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```gts
export default class SequenceRecorder extends Component {
  formatForDisplay = useFormatForDisplay()
  recorder = useHotkeyRecorder(this, {
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })

  get label() {
    const { isRecording, steps, recordedHotkey } = this.recorder
    if (isRecording) return this.formatForDisplay(steps) || 'Press chords, then Enter...'
    return recordedHotkey ? this.formatForDisplay(recordedHotkey) : 'Click to record'
  }

  <template>
    <button type='button' {{on 'click' this.recorder.startRecording}}>{{this.label}}</button>
  </template>
}
```

A one-step recording commits as a chord, so the result can always go straight to `useHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./hotkeys-docs-framework-ember-guides-sequences-md-0637d856.md#source-hotkeys-docs-framework-ember-guides-sequences-md) for how sequences match.

Options can also be a getter, such as `useHotkeyRecorder(this, () => ({ maxSteps: Infinity, recordBy: this.mode, onRecord }))`, read during recording and commit.
