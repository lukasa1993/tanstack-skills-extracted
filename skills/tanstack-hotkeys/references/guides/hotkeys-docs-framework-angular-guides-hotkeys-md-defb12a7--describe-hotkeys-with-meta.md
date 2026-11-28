# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Describe hotkeys with `meta`

Attach display metadata (`name`, `description`, `group`) with `meta`:

```ts
injectHotkey('Mod+S', () => this.save(), {
  meta: { name: 'Save', description: 'Save the document', group: 'File' },
})
```

`meta` has no effect on key matching. It appears in devtools and feeds UI lists such as help dialogs. See [Cheat Sheets](./hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md-725426f1.md#source-hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md).
