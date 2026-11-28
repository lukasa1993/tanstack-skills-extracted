# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Register multiple hotkeys

Use `useHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```tsx
import { useHotkeys } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  return <textarea />
}
```

Chords and sequences can share the same array, and each item's `options` are still typed against its specific `hotkey`. Inside `useHotkeys`, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

```tsx
useHotkeys([
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
import { useRef } from 'preact/hooks'

function RichTextEditor() {
  const editorRef = useRef<HTMLDivElement>(null)

  useHotkeys(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: canUndo } },
    ],
    { target: editorRef },
  )

  return <div ref={editorRef} contentEditable />
}
```

Options merge in layers: provider defaults first, then shared `useHotkeys` options, then per-item options.

### Build the list from data

Hooks can't run in loops, so `useHotkeys` is the right tool for dynamic shortcut lists:

```tsx
function MenuShortcuts({ items }: { items: Array<MenuItem> }) {
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
}
```

`useHotkeys` diffs the array by index and hotkey between renders. It adds new items, removes deleted ones, and re-registers any items whose position changed.
