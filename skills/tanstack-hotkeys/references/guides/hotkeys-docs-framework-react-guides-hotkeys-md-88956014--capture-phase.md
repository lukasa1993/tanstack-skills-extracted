# Hotkeys — Capture phase

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Capture phase

By default, hotkeys listen during bubbling, after the keyboard handlers of widgets inside the target. A widget that handles a key and stops propagation keeps that key from your hotkeys. Set `capture: true` to run the hotkey before those widgets instead. It applies to `keydown` and `keyup`.

With the default `stopPropagation: true`, a matching capture hotkey also keeps the key from those widgets. Set `stopPropagation: false` to let them handle it too. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for when to use capture.

For example, intercept an application's close-view shortcut before a tab widget treats it as a bare Backspace:

```tsx
useHotkey('Mod+Backspace', () => closeView(), { capture: true })
```
