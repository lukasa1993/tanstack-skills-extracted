# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```ts
@hotkey('Mod+S', {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
save() {}
```

`meta` doesn't change how a hotkey behaves. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md-a557e5c4.md#source-hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md).
