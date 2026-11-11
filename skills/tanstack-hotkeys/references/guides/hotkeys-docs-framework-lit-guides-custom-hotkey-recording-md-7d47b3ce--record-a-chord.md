# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Record a chord

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRecorderController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-recorder')
class ShortcutRecorder extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+[KeyS]'
  })

  render() {
    const { isRecording, recordedHotkey } = this.recorder
    return html`
      <button @click=${() => this.recorder.startRecording()}>
        ${isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'}
      </button>
      ${isRecording
        ? html`<button @click=${() => this.recorder.cancelRecording()}>Cancel</button>`
        : ''}
    `
  }
}
```

The recorder records the key's position by default, so Option+S on macOS records `Alt+[KeyS]`, even though it types `ß`. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `HotkeyController`, and label it with `formatForDisplay`. [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults. Set `recordBy: 'key'` to record the character instead.

The controller adds itself to the element, requests an update whenever its state changes, and has the recorder's state and controls:

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is listening |
| `steps` | Chords recorded so far in a sequence recording |
| `recordedHotkey` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |
