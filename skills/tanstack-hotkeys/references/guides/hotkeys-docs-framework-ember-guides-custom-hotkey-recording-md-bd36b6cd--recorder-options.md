# Custom Hotkey Recording — Recorder options

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded hotkey when a recording commits, and with the same context as `validate` |
| `onCancel` | None | Called when the user presses Escape, Tab, or Shift+Tab, or you call `cancelRecording()` |
| `onClear` | None | Called when the user presses Backspace or Delete with nothing recorded |
| `maxSteps` | `1` | `1` records a chord. `Infinity` records a sequence. |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether plain Enter commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step. The timer starts after the first chord. |
| `recordBy` | `'auto'` | Records the key by name where it has one and by position otherwise (`'auto'`), always by position (`'code'`), or always by the character it types (`'key'`) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records Tab and Shift+Tab instead of letting them cancel and move focus |
| `validate` | None | Accepts or rejects a recording. See [Reject hotkeys you don't want](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects a recording that collides with a registered hotkey. See [Check for conflicts](./hotkeys-docs-framework-ember-guides-custom-hotkey-recording-md-bd36b6cd.md#check-for-conflicts). |
| `onReject` | None | Called with the reason when a recording is rejected |
| `platform` | Detected | The platform that decides what `Mod` means |

To change the defaults for several recorders, pass `hotkeyRecorder` options to `createHotkeysScope`, and pass the scope as the third argument: `useHotkeyRecorder(this, options, createHotkeysScope({ hotkeyRecorder: { idleTimeoutMs: 2000 } }))`. Options you pass to `useHotkeyRecorder` take precedence. The [`useHotkeyRecorder` reference](https://github.com/TanStack/hotkeys/blob/1f0a2c627c4a18f005762600966a81e9b8daef3a/docs/framework/ember/reference/functions/useHotkeyRecorder.md) lists the types.

The [useHotkeyRecorder example](https://github.com/TanStack/hotkeys/tree/1f0a2c627c4a18f005762600966a81e9b8daef3a/examples/ember/useHotkeyRecorder) records chords, and the [sequences example](https://github.com/TanStack/hotkeys/tree/1f0a2c627c4a18f005762600966a81e9b8daef3a/examples/ember/useHotkeyRecorder-sequences) records sequences.
