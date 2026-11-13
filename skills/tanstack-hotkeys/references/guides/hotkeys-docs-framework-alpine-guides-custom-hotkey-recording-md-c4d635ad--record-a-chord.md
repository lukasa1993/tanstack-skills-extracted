# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Record a chord

```ts
import Alpine from 'alpinejs'
import { createHotkeyRecorder, createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('shortcutRecorder', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()
  const recorder = createHotkeyRecorder(hotkeys, {
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+S'
  })

  return {
    recorder,
    get label() {
      if (recorder.isRecording) return 'Press a key combination...'
      return recorder.recordedHotkey
        ? formatForDisplay(recorder.recordedHotkey)
        : 'Click to record'
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<div x-data="shortcutRecorder">
  <button @click="recorder.startRecording()" x-text="label"></button>
  <button x-show="recorder.isRecording" @click="recorder.cancelRecording()">Cancel</button>
</div>
```

The recorder writes the hotkey the way you would write it by hand. Command+S on macOS, or Control+S on Windows and Linux, records `Mod+S` on any keyboard layout. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `createHotkey`, and label it with `createFormatForDisplay`.

Some presses have no name that means the same thing on every platform. The recorder records those by the key's position, in brackets: Shift+/ records `Shift+[Slash]`, and Option+1 on macOS records `Alt+[Digit1]`, even though it types `¡`. [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) lists these cases. Set `recordBy: 'code'` to record every key by position, or `recordBy: 'key'` to record the character every press types. Recording by position needs a physical code, so it rejects a press that has none.

### Use the `$hotkeyRecorder` magic

Install `hotkeyRecorderPlugin` to add the `$hotkeyRecorder` magic. It creates a recorder that the plugin destroys with its element:

```ts
import Alpine from 'alpinejs'
import { hotkeyRecorderPlugin, hotkeysPlugin } from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)
Alpine.plugin(hotkeyRecorderPlugin)
```

```html
<div
  x-data="{ recorder: null, hotkey: null }"
  x-init="recorder = $hotkeyRecorder({ onRecord: (value) => (hotkey = value) })"
>
  <button @click="recorder.startRecording()" x-text="recorder.isRecording ? 'Press keys...' : 'Record'"></button>
  <span x-text="hotkey"></span>
</div>
```

`$hotkeyRecorder` uses the built-in defaults. Call it in `x-init` or `init()`, not in a reactive expression.

### Recorder state and controls

The recorder has its state and controls. State members are reactive getters, so read them from the recorder instead of destructuring them once:

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is listening |
| `steps` | Chords recorded so far in a sequence recording |
| `recordedHotkey` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |
