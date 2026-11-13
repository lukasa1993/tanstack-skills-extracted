# Sensible Defaults — Chords fire on keydown and repeat while held

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Chords fire on keydown and repeat while held

Chords fire on `keydown`, when the user presses the key, rather than on release. Holding a key fires the chord again on each automatic repeat, as holding Control+Z in a text editor repeats undo.

For a toggle, such as opening and closing a panel, repeating is usually wrong: holding the key would make the panel flicker. Set `requireReset: true` to fire once per press. Releasing the key or any of its modifiers allows the chord to fire again. So does a new press that isn't an automatic repeat, so a lost keyup, such as the one macOS drops while Command is held, never blocks the chord.

Set `eventType: 'keyup'` to fire on release instead, for example to end a mode that started when a key went down. A keyup chord fires when the user releases its key or one of its modifiers, whichever comes first, unless another key was pressed in between. It fires only for the release of a press that matched it, so a release whose press happened before the page had focus, or a key pressed before its modifiers, doesn't fire it. So `Mod+K` on keyup works on macOS, which sends no keyup for a key released while Command is held. A keyup chord also prevents its keydown, so the browser doesn't act on it, such as opening the Save dialog for `Mod+S`. Set `preventDefault: false` to let the browser act.
