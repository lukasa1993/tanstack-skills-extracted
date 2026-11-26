# Custom Hotkey Recording — Record a sequence

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Record a sequence

Set `maxSteps: Infinity` to capture multi-step sequences. Each chord appends a step, and the recording commits when the user presses `Enter` or, when `idleTimeoutMs` is configured, stops typing for that duration:

```ts
@Component({
  selector: 'app-sequence-recorder',
  template: `
    <button (click)="recorder.startRecording()">
      {{
        recorder.isRecording()
          ? formatForDisplay(recorder.steps()) || 'Press chords, then Enter...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
  `,
})
export class SequenceRecorderComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  readonly recorder = injectHotkeyRecorder({
    maxSteps: Infinity,
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // 'Mod+S' or ['G', 'G']
  })
}
```

If the user commits after a single chord, `injectHotkeyRecorder` simplifies it to a chord string instead of a one-element array, so the result can always go straight to `injectHotkey`. With `maxSteps: Infinity`, `onRecord` and `validate` receive a `Hotkey`, which is a chord or a sequence. See [Sequences](./hotkeys-docs-framework-angular-guides-sequences-md-58c19666.md#source-hotkeys-docs-framework-angular-guides-sequences-md) for how sequences match.

Options can also be a getter, such as `injectHotkeyRecorder(() => ({ maxSteps: Infinity, recordBy: this.mode(), onRecord }))`, so the recorder follows signals.
