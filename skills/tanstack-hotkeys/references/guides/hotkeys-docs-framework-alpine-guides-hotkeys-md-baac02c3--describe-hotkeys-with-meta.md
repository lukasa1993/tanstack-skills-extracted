# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```ts
this.hotkeys.createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-alpine-guides-cheat-sheet-ui-helpers-md-c2bc3613.md#source-hotkeys-docs-framework-alpine-guides-cheat-sheet-ui-helpers-md).
