# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register multiple hotkeys

Use `createHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  return <textarea />
}
```

Chords and sequences can share the same array, and each item's `options` are still typed against its specific `hotkey`. Inside `createHotkeys`, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

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

Pass shared options as the second argument. Individual definitions override them:

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

  return <div ref={setEditor} contenteditable />
}
```

Options merge in three layers: provider defaults first, then shared `createHotkeys` options, then per-item options.

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

`createHotkeys` diffs the array by index and hotkey each time it changes. It adds new items, removes deleted ones, and re-registers any items whose position changed.
