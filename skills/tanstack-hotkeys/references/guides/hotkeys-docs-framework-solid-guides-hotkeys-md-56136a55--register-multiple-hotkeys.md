# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `createHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  return <textarea />
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `createHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```tsx
createHotkeys([
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

```tsx
import { createSignal } from 'solid-js'

function RichTextEditor() {
  const [editor, setEditor] = createSignal<HTMLDivElement | null>(null)

  createHotkeys(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      {
        hotkey: 'Mod+Z',
        callback: () => undo(),
        options: { get enabled() { return canUndo() } },
      },
    ],
    () => ({ target: editor() }),
  )

  return <div ref={setEditor} contentEditable />
}
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#hotkey-targets) explains targets.

Options merge in this order: provider defaults, then the shared options, then each definition's options.

### Build the list from data

A component runs once, so a plain array never changes after it registers. Pass an accessor for any list whose length can change:

```tsx
function MenuShortcuts(props: { items: Array<MenuItem> }) {
  createHotkeys(() =>
    props.items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )

  return <menu>...</menu>
}
```

The primitive compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
