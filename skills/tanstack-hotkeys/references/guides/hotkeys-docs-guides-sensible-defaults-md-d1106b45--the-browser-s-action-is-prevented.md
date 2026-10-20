# Sensible Defaults — The browser's action is prevented

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## The browser's action is prevented

`preventDefault` and `stopPropagation` are `true` by default. Most shortcuts exist to replace a browser action: binding `Mod+S` to save a document should not also open the browser's Save Page dialog, and binding `Mod+K` to a command palette should not also focus the address bar. Stopping propagation keeps one key press from running both your shortcut and another listener higher in the page.

Both apply only when a hotkey matches; every other key press is left alone. For a sequence, every step that advances it calls `preventDefault`, so the browser doesn't act on `Mod+K` in `['Mod+K', 'Mod+C']`. Propagation stops only on the last step, so earlier steps still reach other listeners. Set either option to `false` when you want to observe a shortcut without taking it over.

Some browser and operating system shortcuts never reach the page and cannot be overridden. Browsers keep `Mod+T`, `Mod+N`, and `Mod+W` for opening and closing tabs and windows, and the operating system keeps shortcuts such as `Alt+Tab` and `Command+Tab`. Pick other keys for your app.
