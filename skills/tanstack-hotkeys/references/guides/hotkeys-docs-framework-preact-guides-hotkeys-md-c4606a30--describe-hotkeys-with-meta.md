# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. Devtools show it, and you can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md-0544b194.md#source-hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md).
