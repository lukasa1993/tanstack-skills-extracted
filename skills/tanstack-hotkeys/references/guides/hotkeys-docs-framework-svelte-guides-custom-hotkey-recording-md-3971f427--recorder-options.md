# Custom Hotkey Recording — Recorder options

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded `hotkey` and `context` when a recording commits |
| `onCancel` | None | Called on `Escape`, `Tab`, `Shift+Tab`, the window losing focus, or `cancelRecording()` |
| `cancelOnBlur` | `true` | Cancels when the window loses focus. Set `false` to keep recording |
| `onClear` | None | Called when `Backspace` or `Delete` is pressed with no recorded steps |
| `maxSteps` | `1` | `1` for chords, `Infinity` for sequences |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether `Enter` commits (`'enter'`) or records as a step (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, commits after this many milliseconds without a new step, counted from the first chord |
| `recordBy` | `'auto'` | `'auto'` (portable names with physical fallbacks), `'code'` (physical), or `'key'` (typed character) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records `Tab` and `Shift+Tab` instead of cancelling and moving focus |
| `validate` | None | Custom validator returning `true`, `false`, or an error message. See [Reject hotkeys you don't want](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects recordings that collide with registered hotkeys. See [Check for conflicts](./hotkeys-docs-framework-svelte-guides-custom-hotkey-recording-md-3971f427.md#check-for-conflicts). |
| `onReject` | None | Called with `{ reason, hotkey?, conflicts?, message? }` when a recording is rejected |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` output |

Set defaults for all recorders with `hotkeyRecorder` in the `defaultOptions` of `HotkeysProvider`. See [Set default options](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md) and the [`createHotkeyRecorder` reference](https://github.com/TanStack/hotkeys/blob/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/docs/framework/svelte/reference/functions/createHotkeyRecorder.md).

Try the [create-hotkey-recorder example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/svelte/create-hotkey-recorder) or the [sequences recorder example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/svelte/create-hotkey-recorder-sequences).
