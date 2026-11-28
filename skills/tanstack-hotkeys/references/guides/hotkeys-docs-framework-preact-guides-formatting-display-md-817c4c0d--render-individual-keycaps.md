# Formatting Display — Render individual keycaps

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Render individual keycaps

Pass `parts: true` to receive an array of key strings instead of a joined label, which works well for styling individual `<kbd>` tags:

```ts
const saveHotkey = 'Mod+[KeyS]'
const parts = formatForDisplay(saveHotkey, { platform: 'mac', parts: true })
// ['⌘', 'S']
```

`parts: true` keeps literal `+` keys intact and ignores `separatorToken`. Note that passing a dynamic boolean for `parts` widens the return type to `string | string[]`.
