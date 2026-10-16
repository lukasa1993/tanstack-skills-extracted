# Sensible Defaults — Typing in inputs does not trigger shortcuts

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Typing in inputs does not trigger shortcuts

A hotkey bound to `K` should not fire while the user types "okay" into a text field. By default, `ignoreInputs` is `'auto'`, which chooses from the hotkey itself:

| Hotkey | Default | Reason |
| --- | --- | --- |
| `K`, `Shift+K`, `Alt+K`, `?` | Ignored in inputs | These keys type text |
| `Mod+S`, `Control+K`, `Meta+Enter` | Fire in inputs | Control and Meta chords don't type text, and users expect save and similar commands to work from a field |
| `Escape` | Fires in inputs | Users expect Escape to close a dialog even when a field inside it has focus |

For a sequence, the first step decides, so `['G', 'G']` is ignored in inputs.

Text inputs, textareas, selects, and `contenteditable` elements count as inputs, including inside shadow DOM. Button-type inputs (`type="button"`, `"submit"`, and `"reset"`) do not, so shortcuts still work when the user has tabbed to a form button. A hotkey whose `target` is the input itself always receives that input's events.

Set `ignoreInputs: true` or `false` to choose explicitly.
