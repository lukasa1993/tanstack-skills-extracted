# Formatting Display — Choose symbols and separators

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Choose symbols and separators

Customize modifier and key symbols (`useSymbols`) and separators (`separatorToken`, `sequenceSeparator`):

```ts
formatForDisplay('Shift+[ArrowUp]', {
  platform: 'mac',
  useSymbols: { modifiers: false, keys: true },
  parts: true,
}) // ['Shift', '↑']

formatForDisplay('Mod+[KeyS]', {
  platform: 'mac',
  useSymbols: false,
}) // 'Cmd+S'

formatForDisplay('Control++', {
  platform: 'windows',
  separatorToken: ' · ',
}) // 'Ctrl · +'
```

`useSymbols` accepts a boolean or `{ modifiers?, keys? }`. Omitted fields default to `true`, and `modifiers` affects macOS only because Windows and Linux always use text modifier names. Pass `''` to join parts directly, or `undefined` or `null` for platform defaults.
