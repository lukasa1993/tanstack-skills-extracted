# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Record a chord

```tsx
import { Show } from 'solid-js'
import { createFormatForDisplay, createHotkeyRecorder } from '@tanstack/solid-hotkeys'

function ShortcutRecorder() {
  const formatForDisplay = createFormatForDisplay()
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })

  const label = () => {
    if (recorder.isRecording()) return 'Press a key combination...'
    const hotkey = recorder.recordedHotkey()
    return hotkey ? formatForDisplay(hotkey) : 'Click to record'
  }

  return (
    <div>
      <button onClick={recorder.startRecording}>{label()}</button>
      <Show when={recorder.isRecording()}>
        <button onClick={recorder.cancelRecording}>Cancel</button>
      </Show>
    </div>
  )
}
```

The recorder writes the hotkey the way you would write it by hand. Command+S on macOS, or Control+S on Windows and Linux, records `Mod+S` on any keyboard layout. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `createHotkey`, and label it with `createFormatForDisplay`.

Some presses have no name that means the same thing on every platform. The recorder records those by the key's position, in brackets: Shift+/ records `Shift+[Slash]`, and Option+1 on macOS records `Alt+[Digit1]`, even though it types `¡`. [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) lists these cases. Set `recordBy: 'code'` to record every key by position, or `recordBy: 'key'` to record the character every press types. Recording by position needs a physical code, so it rejects a press that has none.

`createHotkeyRecorder` returns the recorder's state and controls. Each state member is an accessor:

| Member | Description |
| --- | --- |
| `isRecording()` | Whether the recorder is listening |
| `steps()` | Chords recorded so far in a sequence recording |
| `recordedHotkey()` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |
