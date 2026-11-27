# Sensible Defaults — Listeners attach to the document

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Listeners attach to the document

Hotkeys listen on `document` by default so they work regardless of focus. Internally, TanStack Hotkeys attaches at most one `keydown` and one `keyup` listener per target (plus a capture pair if any hotkey uses `capture: true`), no matter how many shortcuts you register.

- Pass an element `target` to scope a shortcut to focus inside that element, adding `tabIndex` if the element isn't natively focusable.
- Hotkeys can target same-origin iframes or popups (`document`, `window`, or an element inside them). `ignoreInputs` works inside those frames automatically.
- No listeners are attached during server rendering.
