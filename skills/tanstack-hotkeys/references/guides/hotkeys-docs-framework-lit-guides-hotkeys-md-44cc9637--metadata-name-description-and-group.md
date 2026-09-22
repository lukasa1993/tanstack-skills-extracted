# Hotkeys — Metadata (name, description, and group)

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Metadata (name, description, and group)

Every hotkey registration can carry a `meta` object with a `name`, `description`, and `group`. Metadata never affects hotkey behavior, but it flows through to registrations and devtools, so you can build shortcut palettes and help screens from it.

```ts
@hotkey('Mod+S', { meta: { name: 'Save', description: 'Save the document' } })
save() { saveDocument() }

// Or with HotkeyController:
new HotkeyController(this, 'Mod+S', () => this.save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name`, `description`, and `group` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
  }
}

@hotkey('Mod+S', { meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' } })
save() { saveDocument() }
```

Group is descriptive metadata, not an execution scope. A shortcuts panel can group live registration views directly. Disabled registrations remain listed; unmounted registrations disappear.
