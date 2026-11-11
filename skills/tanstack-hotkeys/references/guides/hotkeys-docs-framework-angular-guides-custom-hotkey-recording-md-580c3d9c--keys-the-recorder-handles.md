# Custom Hotkey Recording — Keys the recorder handles

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Keys the recorder handles

| Key | What it does |
| --- | --- |
| A modifier alone, such as Shift | Waits for a key to go with it |
| A key, with or without modifiers | Records a chord, such as `Mod+[KeyS]` or `[F1]` |
| Enter | Commits a sequence recording. With `maxSteps: 1` or `commitKeys: 'none'`, records Enter like any other key. |
| Escape | Cancels the recording and calls `onCancel` |
| Tab or Shift+Tab, without Control, Alt, or Meta | Cancels the recording and calls `onCancel`, and the browser moves focus as usual. In a text field, moves focus without cancelling. With `recordTab: true`, records Tab like any other key. |
| Backspace or Delete, without modifiers | Removes the last step. With no steps, stops recording and calls `onClear`. |

Repeats and IME composition never add a step. `onClear` doesn't change anything on its own, so your app decides whether clearing removes a hotkey or restores its default.

By default, the recorder ignores typing in text fields, so other fields on the page keep working while it listens. Escape still cancels. Set `ignoreInputs: false` to record from inside a text field.

Tab and Shift+Tab end the recording, so keyboard users don't get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). Set `recordTab: true` to let users bind Tab, for example in an editor. Escape still cancels, so show it while recording, such as "Press Escape to cancel".
