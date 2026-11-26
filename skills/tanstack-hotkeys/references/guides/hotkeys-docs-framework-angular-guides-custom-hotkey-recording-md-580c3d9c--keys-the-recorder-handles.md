# Custom Hotkey Recording — Keys the recorder handles

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Keys the recorder handles

| Key | Behavior while recording |
| --- | --- |
| Standalone modifier, such as `Shift` or `Control` | Waits for a non-modifier key |
| Key press, with or without modifiers | Captures a chord such as `Mod+S` or `F1` |
| `Enter` | Commits a sequence. With `maxSteps: 1` or `commitKeys: 'none'`, records `Enter` instead. |
| `Escape` | Cancels recording and calls `onCancel` |
| `Tab` or `Shift+Tab` without `Control`, `Alt`, or `Meta` | Cancels and lets focus move normally, so keyboard users never get stuck on the recorder ([WCAG 2.1.2](https://www.w3.org/WAI/WCAG21/Understanding/no-keyboard-trap.html)). In a text field, `Tab` moves focus without cancelling. Set `recordTab: true` to record `Tab` instead, and show "Press Escape to cancel". |
| `Backspace` or `Delete` without modifiers | Removes the last sequence step, or stops and calls `onClear` when empty |

Key auto-repeats and IME compositions never add steps. Typing inside other text fields passes through while recording, and `Escape` still cancels. Pass `ignoreInputs: false` to record inside inputs. `onClear` doesn't delete anything on its own, so decide in your callback whether clearing unbinds the shortcut or resets its default.
