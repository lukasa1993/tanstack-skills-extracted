# Hotkeys — Describe hotkeys with `meta`

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Describe hotkeys with `meta`

Give a hotkey a name, a description, and a group with `meta`:

```hbs
{{useHotkey
  'Mod+S'
  this.save
  meta=(hash name='Save' description='Save the document' group='File')
}}
```

`meta` doesn't change how a hotkey behaves. You can build a list of your app's shortcuts from it. See [Cheat Sheet UI Helpers](./hotkeys-docs-framework-ember-guides-cheat-sheet-ui-helpers-md-5bcba5e0.md#source-hotkeys-docs-framework-ember-guides-cheat-sheet-ui-helpers-md).
