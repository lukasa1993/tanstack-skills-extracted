# Sensible Defaults — Held keys reset when the window loses focus

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

## Held keys reset when the window loses focus

Key state tracking marks a key as held on keydown and releases it on keyup. If the window loses focus while a key is down, such as when the user switches apps with Command+Tab, the browser never delivers the keyup. Held keys are therefore cleared when the window loses focus, and when the page is hidden, such as when the user switches tabs. A native context menu also takes the keyup, so opening one, with the ContextMenu key or a right-click, clears every held key except the modifiers the event still reports. A context menu the page shows itself, by calling `preventDefault()` on the `contextmenu` event, keeps focus and clears nothing.

On macOS, the system can also swallow the keyup of a key pressed with Command. Releasing a modifier clears any other keys still marked as held, so no key is stuck.

Some system shortcuts swallow a modifier's own keyup without taking focus from the page, such as Command+Shift+4 for a screenshot on macOS, or the DevTools inspect shortcut. Every keyboard and mouse event reports which modifiers are down, so the next key press, mouse movement, or click releases any modifier it reports as up. Only real user input counts: events that page code dispatches report no modifiers, so the tracker ignores them for this. Until such an event arrives, the modifier stays held, because nothing distinguishes a missed release from a long hold.
