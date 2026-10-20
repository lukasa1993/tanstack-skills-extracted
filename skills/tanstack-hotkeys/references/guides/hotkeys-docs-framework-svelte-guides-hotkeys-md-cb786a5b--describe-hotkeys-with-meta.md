# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```ts
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. Devtools show it, and you can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./hotkeys-docs-framework-svelte-guides-cheat-sheet-ui-helpers-md-95cb1921.md#source-hotkeys-docs-framework-svelte-guides-cheat-sheet-ui-helpers-md).
