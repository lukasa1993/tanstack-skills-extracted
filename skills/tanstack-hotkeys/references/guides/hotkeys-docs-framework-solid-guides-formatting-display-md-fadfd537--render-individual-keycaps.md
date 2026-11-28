# Formatting Display — Render individual keycaps

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Render individual keycaps

Pass `parts: true` to receive an array of key strings instead of a joined label, which works well for styling individual `<kbd>` tags:

```ts
const saveHotkey = 'Mod+[KeyS]'
const parts = formatForDisplay(saveHotkey, { platform: 'mac', parts: true })
// ['⌘', 'S']
```

`parts: true` keeps literal `+` keys intact and ignores `separatorToken`. Note that passing a dynamic boolean for `parts` widens the return type to `string | string[]`.
