# Sensible Defaults — Typing in inputs does not trigger shortcuts

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Typing in inputs does not trigger shortcuts

A hotkey bound to `K` shouldn't fire when the user types "okay" into a search box. By default, `ignoreInputs` is `'auto'`, which decides based on the hotkey itself (using the first step for sequences):

| Hotkey | Behavior in inputs | Why |
| --- | --- | --- |
| `K`, `Shift+K`, `Alt+K`, `?` | Ignored | These keys type text |
| `ArrowLeft`, `Home`, `Backspace`, `Enter` | Ignored | A text field uses these keys to move the caret and edit text |
| `Mod+S`, `Control+K`, `Meta+Enter` | Fires | Primary shortcuts shouldn't break while editing |
| `Escape` | Fires | Users expect `Escape` to close dialogs from inside inputs |
| `F5`, `Shift+F10`, `MediaPlayPause` | Fires | Function keys and media keys don't type text, and a text field does nothing with them |

Function keys are `F1` to `F24`. Media keys are the keys whose names start with `Audio`, `Browser`, `Launch`, or `Media`, such as `AudioVolumeMute`, `BrowserBack`, `LaunchMail`, and `MediaTrackNext`. Both kinds fire in inputs with any modifiers. A sequence follows its first step, so `['F2', 'R']` also fires in inputs, and the `R` press doesn't type into the field.

These elements count as inputs, including inside open shadow roots:

- Editable `<input>` types (`text`, `search`, `email`, `number`, and date or time types, unless `readOnly`)
- Non-`readOnly` `<textarea>` and `<select>` elements
- `contenteditable` elements and `role="textbox"` or `role="searchbox"`
- Elements hiding focus inside a closed shadow root, or form-associated custom elements without a `role` attribute

Non-text controls (checkboxes, radios, ranges, color, file, and buttons) are not text inputs, so `K` still fires there. They only protect the specific keys they use (see below). Custom elements can set a `role` like `role="checkbox"` for the same behavior.

A hotkey whose `target` is the input element itself always receives its events. To let a shortcut like `Enter` submit a form from its text fields, set `ignoreInputs: false`. To ignore even `Mod` shortcuts inside inputs, set `ignoreInputs: true`.

### `Mod` chords can replace text editing shortcuts

Control and Meta chords fire in inputs, so a hotkey can take a chord that the browser uses to edit text. A `Mod+Z` hotkey on the document runs your undo while the user types in a text field, and the field's own undo doesn't run. These shortcuts are the ones to check:

- Undo and redo: `Mod+Z`, `Mod+Shift+Z`, and `Control+Y` on Windows
- Select all, copy, cut, and paste: `Mod+A`, `Mod+C`, `Mod+X`, and `Mod+V`
- Caret movement and deletion by word or line: `Mod` with an arrow key, `Backspace`, or `Delete`
- Formatting in rich text fields: `Mod+B`, `Mod+I`, and `Mod+U`

`'auto'` doesn't detect these chords, because no list of them is complete. Text editing shortcuts differ between operating systems, macOS lets users rebind them, and the browser doesn't report whether a key press edits the field.

If the text field should keep the chord, set `ignoreInputs: true` on the hotkey. The hotkey then runs everywhere except while a text field has focus. If the hotkey belongs to one part of the page, such as a canvas or a data grid, set `target` to that element instead, so key presses in fields outside the element never reach the hotkey.

An editor that handles these chords itself is the opposite case. Register the hotkeys with the editor's element as the `target`. A hotkey always receives the events of its own target, so `ignoreInputs` doesn't apply.
