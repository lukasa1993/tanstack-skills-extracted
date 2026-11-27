# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Record a chord

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  FormatForDisplayController,
  HotkeyRecorderController,
} from '@tanstack/lit-hotkeys'

@customElement('shortcut-recorder')
class ShortcutRecorder extends LitElement {
  private formatForDisplay = new FormatForDisplayController(this)
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })

  render() {
    const { isRecording, recordedHotkey } = this.recorder
    return html`
      <button @click=${() => this.recorder.startRecording()}>
        ${isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? this.formatForDisplay.format(recordedHotkey)
            : 'Click to record'}
      </button>
      ${isRecording
        ? html`<button @click=${() => this.recorder.cancelRecording()}>Cancel</button>`
        : ''}
    `
  }
}
```

The recorder writes the hotkey the way you would write it by hand. Command+S on macOS, or Control+S on Windows and Linux, records `Mod+S` on any keyboard layout. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `HotkeyController`, and label it with `FormatForDisplayController`.

The recorder writes what the user typed, as you would by hand: Shift+/ records `?`, and Ctrl+Shift+/, or Cmd+Shift+/ on the US `/` key, records `Mod+?`. With Control, Command or Alt, a digit-row key records its digit, so AZERTY Ctrl+& records `Mod+1`. For the few presses whose character the browser reports differently by platform, the recorder records the key's position, in brackets: Option+/ on macOS records `Alt+[Slash]`, even though it types `÷`. A recorded character such as `@` fires wherever the layout types it, which can be a different key. [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) lists these cases. Set `recordBy: 'code'` to record every key by position, or `recordBy: 'key'` to record the character every press types. Recording by position needs a physical code, so it rejects a press that has none.

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
