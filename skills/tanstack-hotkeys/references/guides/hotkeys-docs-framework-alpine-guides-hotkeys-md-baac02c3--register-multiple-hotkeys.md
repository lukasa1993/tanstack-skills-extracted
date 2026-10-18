# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `createHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```ts
init() {
  this.hotkeys.createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])
},
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `createHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```ts
this.hotkeys.createHotkeys([
  {
    hotkey: 'Mod+S',
    callback: (event, context) => {
      if (context.kind === 'chord') console.log(context.parsedChord.modifiers)
    },
  },
])
```

### Share options

Pass options for every definition as the second argument. A definition's own options override them:

```ts
Alpine.data('richTextEditor', () => ({
  canUndo: false,
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkeys(
      () => [
        { hotkey: 'Mod+B', callback: () => toggleBold() },
        { hotkey: 'Mod+I', callback: () => toggleItalic() },
        { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: this.canUndo } },
      ],
      () => ({ target: this.$refs.editor }),
    )
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<div x-data="richTextEditor">
  <div x-ref="editor" contenteditable></div>
</div>
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#hotkey-targets) explains targets. Passing the array as a getter lets `enabled` follow `canUndo`.

Options merge in this order: the owner's defaults, then the shared options, then each definition's options.

### Build the list from data

`init()` runs once, so a plain array never changes after it registers. Pass a getter for any list whose length can change:

```ts
this.hotkeys.createHotkeys(() =>
  this.items.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  })),
)
```

The owner compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
