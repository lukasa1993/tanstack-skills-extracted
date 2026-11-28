# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```ts
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no effect on key matching. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-vue-guides-cheat-sheet-ui-helpers-md-fb272afb.md#source-hotkeys-docs-framework-vue-guides-cheat-sheet-ui-helpers-md).
