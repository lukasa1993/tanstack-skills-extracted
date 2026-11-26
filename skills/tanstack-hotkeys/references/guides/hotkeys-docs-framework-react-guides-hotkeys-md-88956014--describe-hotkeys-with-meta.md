# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no runtime effect on key matching. It appears in devtools and feeds UI lists like help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-react-guides-cheat-sheet-ui-helpers-md-5cace2b3.md#source-hotkeys-docs-framework-react-guides-cheat-sheet-ui-helpers-md).
