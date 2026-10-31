# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```tsx
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. Devtools show it, and you can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md-db8cc71d.md#source-hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md).
