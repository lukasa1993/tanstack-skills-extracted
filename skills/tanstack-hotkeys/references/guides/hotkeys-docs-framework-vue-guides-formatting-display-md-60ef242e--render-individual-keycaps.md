# Formatting Display — Render individual keycaps

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-formatting-display-md-60ef242e.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Render individual keycaps

Set `parts: true` to get one label per key instead of a joined string:

```ts
const saveHotkey = 'Mod+[KeyS]'
const parts = formatForDisplay(saveHotkey, { platform: 'mac', parts: true })
// ['⌘', 'S'], one label per <kbd>
```

With `parts` omitted or false, the result is a string. A runtime boolean returns `string | string[]`. Parts keep literal plus keys and ignore `separatorToken`.
