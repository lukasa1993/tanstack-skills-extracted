# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Record a sequence

Set `maxSteps: Infinity` to let users record a sequence. Each chord adds a step, and the recording commits when the user presses Enter, or after `idleTimeoutMs` without a new step:

```ts
@Component({
  selector: 'app-sequence-recorder',
  template: `
    <button (click)="recorder.startRecording()">
      {{
        recorder.isRecording()
          ? format(recorder.steps()) || 'Press chords, then Enter...'
          : recorder.recordedHotkey()
            ? format(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
  `,
})
export class SequenceRecorderComponent {
  readonly format = formatForDisplay
  readonly recorder = injectHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+[KeyS]' or ['[KeyG]', '[KeyG]']
  })
}
```

A one-step recording commits as a chord, so the result can always go straight to `injectHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which can be a chord or a sequence. See [Sequences](./hotkeys-docs-framework-angular-guides-sequences-md-58c19666.md#source-hotkeys-docs-framework-angular-guides-sequences-md) for how sequences match.

Options can also be a getter, such as `injectHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: this.mode(), onRecord }))`, so the recorder follows signals.
