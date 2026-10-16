# Sensible Defaults — The browser's action is prevented

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## The browser's action is prevented

`preventDefault` and `stopPropagation` are `true` by default. Most shortcuts exist to replace a browser action: binding `Mod+S` to save a document should not also open the browser's Save Page dialog, and binding `Mod+K` to a command palette should not also focus the address bar. Stopping propagation keeps one key press from running both your shortcut and another listener higher in the page.

Both apply only when a hotkey matches; every other key press is left alone. Set either to `false` when you want to observe a shortcut without taking it over.

Some browser and operating system shortcuts, such as closing a tab or switching windows, never reach the page and cannot be overridden.
