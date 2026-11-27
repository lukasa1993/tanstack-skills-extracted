# Custom Hotkey Recording — Recorder options

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Recorder options

| Option | Default | Description |
| --- | --- | --- |
| `onRecord` | Required | Called with the recorded `hotkey` and `context` when committed |
| `onCancel` | None | Called on `Escape`, `Tab`, `Shift+Tab`, the window losing focus, or `cancelRecording()` |
| `cancelOnBlur` | `true` | Cancels when the window loses focus. Set `false` to keep recording |
| `onClear` | None | Called when `Backspace` or `Delete` is pressed with no recorded steps |
| `maxSteps` | `1` | `1` for chords, `Infinity` for sequences |
| `commitKeys` | `'enter'` | With `maxSteps: Infinity`, whether `Enter` commits (`'enter'`) or records (`'none'`) |
| `idleTimeoutMs` | None | With `maxSteps: Infinity`, auto-commits after idle ms following the first chord |
| `recordBy` | `'auto'` | `'auto'` (portable names and physical fallbacks), `'code'` (physical), or `'key'` (typed char) |
| `ignoreInputs` | `true` | Lets typing in text fields pass through while recording |
| `recordTab` | `false` | Records `Tab` and `Shift+Tab` instead of cancelling and moving focus |
| `validate` | None | Custom validator returning `true`, `false`, or an error message |
| `detectConflicts` | `false` | Rejects conflicts with registered hotkeys |
| `onReject` | None | Called with `{ reason, hotkey?, conflicts?, message? }` when rejected |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` output |

Set defaults for all recorders via `HotkeysProvider` using `hotkeyRecorder` in `defaultOptions`. See [Set default options](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) and [`useHotkeyRecorder`](https://github.com/TanStack/hotkeys/blob/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/docs/framework/octane/reference/functions/useHotkeyRecorder.md).

Try the [useHotkeyRecorder example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/octane/useHotkeyRecorder) or [sequences recorder example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/octane/useHotkeyRecorder-sequences).
