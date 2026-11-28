# Sensible Defaults — At a glance

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## At a glance

| Behavior | Default | Change it with |
| --- | --- | --- |
| `Mod` modifier | Command on macOS, Control on Windows and Linux | `platform` |
| Key identity | Character the key types (`event.key`), with position fallback | `[KeyS]` physical bindings |
| Modifiers | Exact match required | List every modifier in the binding |
| Typing in inputs | Single keys and `Shift` or `Alt` chords ignored, while `Control` or `Meta` chords, `Escape`, function keys, and media keys fire | `ignoreInputs` |
| Browser behavior | Calls `preventDefault()` and `stopPropagation()` when matched | `preventDefault`, `stopPropagation` |
| Disabled or inactive hotkeys | Browser acts on the key | `preventDefault: 'always'` |
| When a chord fires | On `keydown`, and on auto-repeat while held | `eventType`, `requireReset` |
| Listener target | `document` | `target` |
| Event phase | Bubble phase (after widget handlers inside target) | `capture` |
| Already-prevented keys | Hotkeys still fire | `ignoreDefaultPrevented` |
| Sequence step timeout | 1 second (`1000` ms) | `timeout` |
| Duplicate registrations | Allowed, with a development console warning | `conflictBehavior` |
| Recording | What the press typed, written as by hand, or a physical fallback. `Escape`, `Tab`, `Shift+Tab` cancel | `recordBy`, `recordTab`, recorder options |
| Display formatting | Symbols on macOS (`⇧ ⌘ S`), text elsewhere (`Ctrl+Shift+S`) | Label formatter options (such as `useFormatForDisplay`) |
