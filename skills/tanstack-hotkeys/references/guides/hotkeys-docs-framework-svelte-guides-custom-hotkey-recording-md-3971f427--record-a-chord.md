# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Record a chord

```svelte
<script lang="ts">
  import { createHotkeyRecorder, getFormatForDisplay } from '@tanstack/svelte-hotkeys'

  const formatForDisplay = getFormatForDisplay()
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })
</script>

<div>
  <button onclick={recorder.startRecording}>
    {recorder.isRecording
      ? 'Press a key combination...'
      : recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'}
  </button>
  {#if recorder.isRecording}
    <button onclick={recorder.cancelRecording}>Cancel</button>
  {/if}
</div>
```

With the default `recordBy: 'auto'`, the recorder outputs portable strings, written like a hand-typed string. Command+S on macOS and Control+S on Windows and Linux both record `Mod+S`. It records what the press typed, such as `?` for Shift+/ and `Mod+1` for AZERTY Ctrl+&. For the few presses whose character the browser reports differently by platform, it falls back to physical bracketed codes, such as `Alt+[Slash]` for macOS Option+/. A recorded character such as `@` fires wherever the layout types it, which can be a different key. See [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full rules. Set `recordBy: 'code'` to always record the physical key, or `recordBy: 'key'` to always record the typed character. Pass the result straight to `createHotkey`, and label it with `getFormatForDisplay`.

`createHotkeyRecorder` returns the recorder's state and controls. State members are reactive getters, so read them from the recorder object instead of destructuring them once:

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is currently listening |
| `steps` | Chords captured so far during a sequence recording |
| `recordedHotkey` | Last committed hotkey, or `null` after cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without triggering `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the current `steps` immediately |
