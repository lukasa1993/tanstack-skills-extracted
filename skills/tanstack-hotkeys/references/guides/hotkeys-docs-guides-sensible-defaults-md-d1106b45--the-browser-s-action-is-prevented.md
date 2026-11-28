# Sensible Defaults — The browser's action is prevented

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## The browser's action is prevented

`preventDefault` and `stopPropagation` both default to `true`. Binding `Mod+S` shouldn't open the browser's Save Page dialog, and binding `Mod+K` shouldn't jump to the address bar or fire duplicate listeners higher in the DOM.

- Unmatched keys are never touched.
- In a sequence like `['Mod+K', 'Mod+C']`, every matching step calls `preventDefault()`, while `stopPropagation()` runs only on the final step so earlier keys still reach other listeners.
- To observe a shortcut without blocking it, set either option to `false`.
- Browsers and operating systems reserve certain shortcuts (`Mod+T`, `Mod+N`, `Mod+W`, `Alt+Tab`, `Command+Tab`) before they ever reach the page. Pick other keys for your app.
- Binding `Tab`, `Shift+Tab`, or `F6` on `document` prevents focus movement across buttons and links. Give those shortcuts an element `target` instead.
