# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no runtime effect on key matching. It appears in devtools and feeds UI lists like help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md-0544b194.md#source-hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md).
