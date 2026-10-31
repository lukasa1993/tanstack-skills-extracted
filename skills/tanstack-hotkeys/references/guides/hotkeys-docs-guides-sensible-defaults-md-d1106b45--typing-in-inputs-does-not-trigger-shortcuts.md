# Sensible Defaults — Typing in inputs does not trigger shortcuts

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Typing in inputs does not trigger shortcuts

A hotkey bound to `K` should not fire while the user types "okay" into a text field. By default, `ignoreInputs` is `'auto'`, which chooses from the hotkey itself:

| Hotkey | Default | Reason |
| --- | --- | --- |
| `K`, `Shift+K`, `Alt+K`, `?` | Ignored in inputs | These keys type text |
| `Mod+S`, `Control+K`, `Meta+Enter` | Fire in inputs | Control and Meta chords don't type text, and users expect save and similar commands to work from a field |
| `Escape` | Fires in inputs | Users expect Escape to close a dialog even when a field inside it has focus |

For a sequence, the first step decides, so `['G', 'G']` is ignored in inputs.

These count as inputs, including inside open shadow roots:

- Text-entry inputs, such as `text`, `search`, `email`, `number`, and the date and time types, unless they are read-only
- Textareas that aren't read-only, and selects
- `contenteditable` elements, and elements with `role="textbox"` or `role="searchbox"`
- Custom elements that may hide a text field: a host whose focus is inside a closed shadow root, and a form-associated custom element without a `role` attribute

Checkbox, radio, range, color, file, and button-type inputs are not text fields, so `K` still fires while one has focus. They keep only the keys they use (see [Focused controls keep their own keys](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#focused-controls-keep-their-own-keys)). A form-associated custom element that isn't a text field can set a `role` attribute, such as `role="checkbox"`, to get the same treatment.

A hotkey whose `target` is the input itself always receives that input's events.

Set `ignoreInputs: true` or `false` to choose explicitly. For example, set `ignoreInputs: false` on an `Enter` hotkey that submits a form, so it works while focus is in the form's text fields.
