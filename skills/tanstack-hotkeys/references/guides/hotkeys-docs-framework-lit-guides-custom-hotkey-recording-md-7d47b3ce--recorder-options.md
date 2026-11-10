# Custom Hotkey Recording — Recorder options

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded hotkey when a recording commits |
| `onCancel` | None | Called when the user presses Escape, Tab, or Shift+Tab, or you call `cancelRecording()` |
| `onClear` | None | Called when the user presses Backspace or Delete with nothing recorded |
| `maxSteps` | `1` | `1` records a chord. `Infinity` records a sequence. |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether plain Enter commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step. The timer starts after the first chord. |
| `recordBy` | `'code'` | Records the key's position (`'code'`) or the character it types (`'key'`) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records Tab and Shift+Tab instead of letting them cancel and move focus |
| `validate` | None | Accepts or rejects a recording. See [Reject hotkeys you don't want](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects a recording that collides with a registered hotkey. See [Check for conflicts](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md#check-for-conflicts). |
| `onReject` | None | Called with the reason when a recording is rejected |
| `platform` | Detected | The platform that decides what `Mod` means |

Lit has no provider, so set recorder options on each controller. The [`HotkeyRecorderController` reference](https://github.com/TanStack/hotkeys/blob/e7cbe578686100589221c8a0b6140496985e6c45/docs/framework/lit/reference/classes/HotkeyRecorderController.md) lists the types.

The [hotkey-recorder example](https://github.com/TanStack/hotkeys/tree/e7cbe578686100589221c8a0b6140496985e6c45/examples/lit/hotkey-recorder) records chords, and the [sequences example](https://github.com/TanStack/hotkeys/tree/e7cbe578686100589221c8a0b6140496985e6c45/examples/lit/hotkey-recorder-sequences) records sequences.
