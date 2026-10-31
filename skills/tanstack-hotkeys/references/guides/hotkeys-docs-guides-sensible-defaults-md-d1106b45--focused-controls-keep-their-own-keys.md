# Sensible Defaults — Focused controls keep their own keys

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Focused controls keep their own keys

Buttons, links, and ARIA widgets also use keys for themselves. A hotkey bound to `Enter` should not stop a focused button from clicking, and a hotkey bound to `ArrowDown` should not also run while the user moves through an open menu. When `ignoreInputs` is on, a hotkey skips these keys while such a control has focus:

| Focused control | Keys it keeps |
| --- | --- |
| `<button>`, button-type, image, color, and file inputs, `<summary>`, `role="button"` | Enter, Space |
| Checkbox inputs | Space |
| Radio inputs | Arrow keys, Space |
| Range inputs | Arrow keys, Home, End, Page Up, Page Down |
| Read-only text inputs | Left, Right, Home, End |
| Read-only textareas | Arrow keys, Home, End, Page Up, Page Down |
| Links with an `href`, `role="link"` | Enter |
| `role="checkbox"`, `"switch"`, `"radio"` | Space |
| `role="tab"`, `"option"`, `"treeitem"`, `"menuitem"` (and its checkbox and radio forms) | Enter, Space |
| `role="menu"`, `"menubar"`, `"tree"` | Arrow keys, Home, End, Enter, Space, and typed characters |
| `role="listbox"` | Up and Down (Left and Right with `aria-orientation="horizontal"`), Home, End, Enter, Space, and typed characters |
| `role="combobox"` without a text field | Up, Down, Home, End, Enter, Space, and typed characters |
| `role="tablist"` | Left and Right (Up and Down with `aria-orientation="vertical"`), Home, End, Enter, Space |
| `role="toolbar"` | Left and Right (Up and Down with `aria-orientation="vertical"`), Home, End |
| `role="grid"`, `"treegrid"` | Arrow keys, Home, End, Page Up, Page Down, Enter, Space |
| `role="radiogroup"` | Arrow keys, Space |
| `role="slider"` | Arrow keys, Home, End, Page Up, Page Down |
| `role="spinbutton"` | Up, Down, Home, End, Page Up, Page Down |

The keys follow the [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/) keyboard patterns. A control counts while it, or an element inside it, has focus, so arrow keys in a menu item belong to the menu. Typed characters are the menu, listbox, or tree's typeahead search.

Control, Meta, and Alt shortcuts are never skipped. Enter and Space are skipped only without modifiers. Navigation keys and typed characters are also skipped with Shift, which widgets use to extend a selection.

A control counts only when it is inside the hotkey's `target`. A hotkey targeted at a dialog skips Enter while the dialog's Cancel button has focus, but a hotkey targeted at a listbox receives the listbox's arrow keys, so the listbox can implement its own navigation with hotkeys. Set `ignoreInputs: false` to handle every key regardless of focus.

The recorder only skips text fields, so it can record Enter or Space while the button that started recording still has focus.
