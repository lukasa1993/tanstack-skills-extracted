# Formatting Display — Render individual keycaps

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

## Render individual keycaps

Set `parts: true` to get one label per key instead of a joined string:

```ts
const saveHotkey = 'Mod+[KeyS]'
const parts = formatForDisplay(saveHotkey, { platform: 'mac', parts: true })
// ['⌘', 'S'], one label per <kbd>
```

With `parts` omitted or false, the result is a string. A runtime boolean returns `string | string[]`. Parts keep literal plus keys and ignore `separatorToken`.
