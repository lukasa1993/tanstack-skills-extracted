# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Record a chord

```ts
import { Component } from '@angular/core'
import { formatForDisplay, injectHotkeyRecorder } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-recorder',
  template: `
    <button (click)="recorder.startRecording()">
      {{
        recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? format(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
    @if (recorder.isRecording()) {
      <button (click)="recorder.cancelRecording()">Cancel</button>
    }
  `,
})
export class ShortcutRecorderComponent {
  readonly format = formatForDisplay
  readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+[KeyS]'
  })
}
```

The recorder records the key's position by default, so Option+S on macOS records `Alt+[KeyS]`, even though it types `ß`. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `injectHotkey`, and label it with `formatForDisplay`. [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults. Set `recordBy: 'key'` to record the character instead.

`injectHotkeyRecorder` returns the recorder's state and controls. State members are signals:

| Member | Description |
| --- | --- |
| `isRecording()` | Whether the recorder is listening |
| `steps()` | Chords recorded so far in a sequence recording |
| `recordedHotkey()` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |
