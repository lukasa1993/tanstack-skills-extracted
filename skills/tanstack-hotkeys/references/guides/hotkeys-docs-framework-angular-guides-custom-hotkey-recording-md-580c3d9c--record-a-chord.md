# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Record a chord

```ts
import { Component } from '@angular/core'
import { injectFormatForDisplay, injectHotkeyRecorder } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-shortcut-recorder',
  template: `
    <button (click)="recorder.startRecording()">
      {{
        recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'
      }}
    </button>
    @if (recorder.isRecording()) {
      <button (click)="recorder.cancelRecording()">Cancel</button>
    }
  `,
})
export class ShortcutRecorderComponent {
  readonly formatForDisplay = injectFormatForDisplay()
  readonly recorder = injectHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })
}
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings, written like a hand-typed string. Command+S on macOS and Control+S on Windows and Linux both record `Mod+S`. It records what the press typed, such as `?` for Shift+/ and `Mod+1` for AZERTY Ctrl+&. For the few presses whose character the browser reports differently by platform, it falls back to physical bracketed codes, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full rules. Set `recordBy: 'code'` to always record the physical key, or `recordBy: 'key'` to always record the typed character. Pass the result straight to `injectHotkey`, and label it with `injectFormatForDisplay`.

`injectHotkeyRecorder` returns the recorder's state and controls. State members are signals:

| Member | Description |
| --- | --- |
| `isRecording()` | Whether the recorder is currently listening |
| `steps()` | Chords captured so far during a sequence recording |
| `recordedHotkey()` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |
