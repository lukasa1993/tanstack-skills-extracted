# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```ts
@hotkey('Mod+S', {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
save() {}
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md-a557e5c4.md#source-hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md).
