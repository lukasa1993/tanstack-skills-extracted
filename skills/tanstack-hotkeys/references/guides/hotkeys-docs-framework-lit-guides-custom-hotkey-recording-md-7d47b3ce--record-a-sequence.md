# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```ts
@customElement('sequence-recorder')
class SequenceRecorder extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+[KeyS]' or ['[KeyG]', '[KeyG]']
  })

  render() {
    const { isRecording, steps, recordedHotkey } = this.recorder
    return html`
      <button @click=${() => this.recorder.startRecording()}>
        ${isRecording
          ? formatForDisplay(steps) || 'Press chords, then Enter...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'}
      </button>
    `
  }
}
```

A one-step recording commits as a chord, so the result can always go straight to `HotkeyController`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./hotkeys-docs-framework-lit-guides-sequences-md-8de222df.md#source-hotkeys-docs-framework-lit-guides-sequences-md) for how sequences match.

Options can also be a getter, such as `new HotkeyRecorderController(this, () => ({ maxSteps: Infinity, recordBy: this.mode, onRecord }))`, read during recording.
