# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```tsx
useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md-3e802195.md#source-hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md).
