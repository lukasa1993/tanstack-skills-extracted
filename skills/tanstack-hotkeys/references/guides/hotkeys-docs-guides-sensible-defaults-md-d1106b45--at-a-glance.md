# Sensible Defaults — At a glance

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## At a glance

| Behavior | Default | Change it with |
| --- | --- | --- |
| `Mod` modifier | Command on macOS, Control on Windows and Linux | `platform` |
| Key identity | The character the key types (`event.key`), with a fallback to the key's position | `[KeyS]` physical bindings |
| Modifiers | Must match exactly | List every modifier in the binding |
| Typing in inputs | Single keys and `Shift`/`Alt` chords are ignored; `Control`/`Meta` chords and `Escape` fire | `ignoreInputs` |
| Browser behavior | Prevented, and the event stops propagating | `preventDefault`, `stopPropagation` |
| When a chord fires | On keydown, and again on each automatic repeat while held | `eventType`, `requireReset` |
| Where listeners attach | `document` | `target` |
| When hotkeys run | After the keyboard handlers of widgets inside the target (bubble phase) | `capture` |
| Time between sequence steps | 1 second | `timeout` |
| Duplicate registrations | Allowed, with a console warning | `conflictBehavior` |
| Recording | Records key positions; Escape cancels | `recordBy`, recorder options |
| Display | Symbols on macOS (`⇧ ⌘ S`), text elsewhere (`Ctrl+Shift+S`) | `formatForDisplay` options |
