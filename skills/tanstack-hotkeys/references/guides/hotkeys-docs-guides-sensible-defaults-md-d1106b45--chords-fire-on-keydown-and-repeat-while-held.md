# Sensible Defaults — Chords fire on keydown and repeat while held

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Chords fire on keydown and repeat while held

By default, chords fire on `keydown` and repeat on each OS auto-repeat tick while held, which suits actions such as holding `Mod+Z` for undo or scrolling.

- **Prevent key repeat (`requireReset: true`).** Ideal for toggles like opening and closing panels so holding the key doesn't flicker. Fires once until you release the key or any modifier, or trigger a fresh non-repeat press (so lost macOS `Command` keyups never get a key stuck).
- **Fire on release (`eventType: 'keyup'`).** Fires when either the key or one of its modifiers is released after a matching press, provided no other key was pressed in between. This works reliably even on macOS (which drops keyups while `Command` is held) and still prevents the `keydown` browser default unless `preventDefault: false`.
