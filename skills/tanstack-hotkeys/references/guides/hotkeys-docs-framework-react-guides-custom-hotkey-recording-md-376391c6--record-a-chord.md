# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-custom-hotkey-recording-md-376391c6.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Record a chord

```tsx
import { useFormatForDisplay, useHotkeyRecorder } from '@tanstack/react-hotkeys'

function ShortcutRecorder() {
  const formatForDisplay = useFormatForDisplay()
  const { isRecording, recordedHotkey, startRecording, cancelRecording } =
    useHotkeyRecorder({
      onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
    })

  return (
    <div>
      <button onClick={startRecording}>
        {isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'}
      </button>
      {isRecording && <button onClick={cancelRecording}>Cancel</button>}
    </div>
  )
}
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings just like you write by hand: `Mod+S` for Command+S on macOS or Control+S on Windows and Linux. It records what the press typed (`?` for Shift+/, `Mod+1` for AZERTY Ctrl+&), and falls back to physical bracketed codes for the few presses whose character the browser reports differently by platform, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full rules, or set `recordBy: 'code'` (always physical) or `recordBy: 'key'` (always typed character).

| Property or method | Description |
| --- | --- |
| `isRecording` | Whether the recorder is currently listening |
| `steps` | Chords captured so far during a sequence recording |
| `recordedHotkey` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |
