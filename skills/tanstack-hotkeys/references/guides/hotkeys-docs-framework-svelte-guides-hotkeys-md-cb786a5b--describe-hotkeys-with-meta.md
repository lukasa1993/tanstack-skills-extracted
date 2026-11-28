# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```ts
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no effect on key matching. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-svelte-guides-cheat-sheet-ui-helpers-md-95cb1921.md#source-hotkeys-docs-framework-svelte-guides-cheat-sheet-ui-helpers-md).
