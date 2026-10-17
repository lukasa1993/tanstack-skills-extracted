# Sensible Defaults — Listeners attach to the document

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Listeners attach to the document

Hotkeys listen on `document` by default, so they work wherever focus is in the page. The library attaches one `keydown` and one `keyup` listener per target, plus another pair if any hotkey on that target uses `capture`, however many hotkeys are registered.

To limit a hotkey to part of the page, set `target` to an element. The element receives keyboard events only while it, or something inside it, has focus, so make sure it is focusable, for example with `tabIndex`.

A hotkey registered from the page can also target the document, window, or an element of a same-origin iframe or popup window. The hotkey then listens in that frame, and typing in the frame's inputs is ignored the same way as in the page.

No listeners are attached during server rendering.
