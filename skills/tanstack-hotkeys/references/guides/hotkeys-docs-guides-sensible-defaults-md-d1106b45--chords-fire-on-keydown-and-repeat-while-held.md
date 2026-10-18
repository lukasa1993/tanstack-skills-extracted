# Sensible Defaults — Chords fire on keydown and repeat while held

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Chords fire on keydown and repeat while held

Chords fire on `keydown`, when the user presses the key, rather than on release. Holding a key fires the chord again on each automatic repeat, as holding Control+Z in a text editor repeats undo.

For a toggle, such as opening and closing a panel, repeating is usually wrong: holding the key would make the panel flicker. Set `requireReset: true` to fire once per press. Releasing the key or any of its modifiers allows the chord to fire again.

Set `eventType: 'keyup'` to fire on release instead, for example to end a mode that started when a key went down.
