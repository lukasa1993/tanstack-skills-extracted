# Custom Hotkey Recording — Recorder options

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

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
| `validate` | None | Accepts or rejects a recording. See [Reject hotkeys you don't want](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#reject-hotkeys-you-dont-want). |
| `detectConflicts` | `false` | Rejects a recording that collides with a registered hotkey. See [Check for conflicts](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#check-for-conflicts). |
| `onReject` | None | Called with the reason when a recording is rejected |
| `platform` | Detected | The platform that decides what `Mod` means |

To change the defaults for every recorder, pass `hotkeyRecorder` options to `provideHotkeys`. See [Set default options](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md). The [`injectHotkeyRecorder` reference](https://github.com/TanStack/hotkeys/blob/a9dd5ea3fb8a4d3d660638add1766bc35ef114f6/docs/framework/angular/reference/functions/injectHotkeyRecorder.md) lists the types.

The [injectHotkeyRecorder example](https://github.com/TanStack/hotkeys/tree/a9dd5ea3fb8a4d3d660638add1766bc35ef114f6/examples/angular/injectHotkeyRecorder) records chords, and the [sequences example](https://github.com/TanStack/hotkeys/tree/a9dd5ea3fb8a4d3d660638add1766bc35ef114f6/examples/angular/injectHotkeyRecorder-sequences) records sequences.
