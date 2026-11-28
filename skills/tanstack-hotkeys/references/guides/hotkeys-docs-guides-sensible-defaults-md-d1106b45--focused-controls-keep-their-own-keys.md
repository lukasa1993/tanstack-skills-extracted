# Sensible Defaults — Focused controls keep their own keys

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Focused controls keep their own keys

Native controls and ARIA widgets use keys like `Space`, `Enter`, and arrow keys for themselves. When `ignoreInputs` is active (`true` or `'auto'`), hotkeys skip those keys while a matching control or element inside it has focus:

| Focused control | Keys it keeps |
| --- | --- |
| `<button>`, button, image, color, and file inputs, `<summary>`, `role="button"` | `Enter`, `Space` |
| Checkbox inputs, `role="checkbox"`, `"switch"`, `"radio"` | `Space` |
| Radio inputs, `role="radiogroup"` | Arrow keys, `Space` |
| Range inputs, `role="slider"` | Arrow keys, `Home`, `End`, `PageUp`, `PageDown` |
| Read-only text inputs | `ArrowLeft`, `ArrowRight`, `Home`, `End` |
| Read-only textareas | Arrow keys, `Home`, `End`, `PageUp`, `PageDown` |
| Links with `href`, `role="link"` | `Enter` |
| `role="tab"`, `"option"`, `"treeitem"`, `"menuitem"` (all forms) | `Enter`, `Space` |
| `role="menu"`, `"menubar"`, `"tree"` | Arrow keys, `Home`, `End`, `Enter`, `Space`, typeahead characters |
| `role="listbox"` | Vertical arrows (horizontal if `aria-orientation="horizontal"`), `Home`, `End`, `Enter`, `Space`, typeahead |
| `role="combobox"` (without a text field) | `ArrowUp`, `ArrowDown`, `Home`, `End`, `Enter`, `Space`, typeahead |
| `role="tablist"` | Horizontal arrows (vertical if `aria-orientation="vertical"`), `Home`, `End`, `Enter`, `Space` |
| `role="toolbar"` | Horizontal arrows (vertical if `aria-orientation="vertical"`), `Home`, `End` |
| `role="grid"`, `"treegrid"` | Arrow keys, `Home`, `End`, `PageUp`, `PageDown`, `Enter`, `Space` |
| `role="spinbutton"` | `ArrowUp`, `ArrowDown`, `Home`, `End`, `PageUp`, `PageDown` |

- `Control`, `Meta`, and `Alt` shortcuts are never skipped here. `Enter` and `Space` are skipped only without modifiers, and navigation or typeahead keys are also skipped with `Shift` for selection extension.
- Controls only reserve keys when they sit *inside* the hotkey's `target`. A hotkey targeted directly at a listbox receives arrow keys so the widget can implement its own navigation. Set `ignoreInputs: false` to bypass this completely.
- The hotkey recorder skips only text fields, so you can still record `Enter` or `Space` while the trigger button keeps focus.
