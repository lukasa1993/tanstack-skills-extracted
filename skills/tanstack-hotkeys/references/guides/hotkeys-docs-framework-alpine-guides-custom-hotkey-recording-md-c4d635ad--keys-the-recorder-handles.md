# Custom Hotkey Recording — Keys the recorder handles

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

## Keys the recorder handles

| Key | What it does |
| --- | --- |
| A modifier alone, such as Shift | Waits for a key to go with it |
| A key, with or without modifiers | Records a chord, such as `Mod+[KeyS]` or `[F1]` |
| Enter | Commits a sequence recording. With `maxSteps: 1` or `commitKeys: 'none'`, records Enter like any other key. |
| Escape | Cancels the recording and calls `onCancel` |
| Backspace or Delete, without modifiers | Removes the last step. With no steps, stops recording and calls `onClear`. |

Repeats and IME composition never add a step. `onClear` doesn't change anything on its own, so your app decides whether clearing removes a hotkey or restores its default.

By default, the recorder ignores typing in text fields, so other fields on the page keep working while it listens. Escape still cancels. Set `ignoreInputs: false` to record from inside a text field.
