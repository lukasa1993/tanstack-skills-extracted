# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

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

With the default `recordBy: 'auto'`, the recorder outputs portable strings like those written by hand: `Mod+S` for Command+S on macOS or Control+S on Windows and Linux. It records what the press typed (`?` for Shift+/, `Mod+1` for AZERTY Ctrl+&), and falls back to physical bracketed codes for the few presses whose character the browser reports differently by platform, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full rules, or set `recordBy: 'code'` (always physical) or `recordBy: 'key'` (always typed character). Recording by position rejects a press that has no physical code.

Pass the result straight to `createHotkey`, and label it with `createFormatForDisplay`. `createHotkeyRecorder` returns the recorder's state and controls. Each state member is an accessor:

| Member | Description |
| --- | --- |
| `isRecording()` | Whether the recorder is currently listening |
| `steps()` | Chords captured so far during a sequence recording |
| `recordedHotkey()` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |
