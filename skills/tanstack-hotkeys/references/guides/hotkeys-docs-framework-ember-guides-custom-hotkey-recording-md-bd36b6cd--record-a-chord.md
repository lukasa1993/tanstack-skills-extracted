# Custom Hotkey Recording — Record a chord

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Record a chord

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { formatForDisplay, useHotkeyRecorder } from '@tanstack/ember-hotkeys'

export default class ShortcutRecorder extends Component {
  recorder = useHotkeyRecorder(this, {
    onRecord: (hotkey) => console.log('Recorded:', hotkey), // e.g. 'Mod+Shift+[KeyS]'
  })

  get label() {
    const { isRecording, recordedHotkey } = this.recorder
    if (isRecording) return 'Press a key combination...'
    return recordedHotkey ? formatForDisplay(recordedHotkey) : 'Click to record'
  }

  <template>
    <button type='button' {{on 'click' this.recorder.startRecording}}>{{this.label}}</button>
    {{#if this.recorder.isRecording}}
      <button type='button' {{on 'click' this.recorder.cancelRecording}}>Cancel</button>
    {{/if}}
  </template>
}
```

The recorder records the key's position by default, so Option+S on macOS records `Alt+[KeyS]`, even though it types `ß`. It records `Mod` rather than Command or Control, so the hotkey works on every platform. Pass the result straight to `useHotkey`, and label it with `formatForDisplay`. [Recording captures what the user pressed](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults. Set `recordBy: 'key'` to record the character instead.

Pass the component as the owner, and the recorder is destroyed with it. The recorder has its state and controls, and its state members are tracked getters:

| Member | Description |
| --- | --- |
| `isRecording` | Whether the recorder is listening |
| `steps` | Chords recorded so far in a sequence recording |
| `recordedHotkey` | The hotkey from the last recording, or `null` after a cancel or clear |
| `startRecording()` | Starts listening |
| `stopRecording()` | Stops listening without calling `onRecord` or `onCancel` |
| `cancelRecording()` | Stops listening and calls `onCancel` |
| `commitRecording()` | Commits the `steps` recorded so far |
