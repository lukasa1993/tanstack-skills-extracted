# Custom Hotkey Recording — Recorder options

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded hotkey when a recording commits |
| `onCancel` | None | Called when the user presses Escape or you call `cancelRecording()` |
| `onClear` | None | Called when the user presses Backspace or Delete with nothing recorded |
| `maxSteps` | `1` | `1` records a chord. `Infinity` records a sequence. |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether plain Enter commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step. The timer starts after the first chord. |
| `recordBy` | `'code'` | Records the key's position (`'code'`) or the character it types (`'key'`) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `validate` | None | Accepts or rejects a recording. See [Reject hotkeys you don't want](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects a recording that collides with a registered hotkey. See [Check for conflicts](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md#check-for-conflicts). |
| `onReject` | None | Called with the reason when a recording is rejected |
| `platform` | Detected | The platform that decides what `Mod` means |

To change the defaults for every recorder on an owner, pass `hotkeyRecorder` options to `createHotkeysScope`, such as `createHotkeysScope({ hotkeyRecorder: { idleTimeoutMs: 2000 } })`. The [`createHotkeyRecorder` reference](https://github.com/TanStack/hotkeys/blob/24f618ff48e83d4dabd039860ee41408326800aa/docs/framework/alpine/reference/functions/createHotkeyRecorder.md) lists the types.

The [createHotkeyRecorder example](https://github.com/TanStack/hotkeys/tree/24f618ff48e83d4dabd039860ee41408326800aa/examples/alpine/createHotkeyRecorder) records chords, and the [sequences example](https://github.com/TanStack/hotkeys/tree/24f618ff48e83d4dabd039860ee41408326800aa/examples/alpine/createHotkeyRecorder-sequences) records sequences.
