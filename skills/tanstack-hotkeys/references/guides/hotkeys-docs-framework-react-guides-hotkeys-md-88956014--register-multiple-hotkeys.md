# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `useHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```tsx
import { useHotkeys } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])

  return <textarea />
}
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `useHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

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

Pass options for every definition as the second argument. A definition's own options override them:

```tsx
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

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md#hotkey-targets) explains targets.

Options merge in this order: provider defaults, then the shared options, then each definition's options.

### Build the list from data

React doesn't allow hooks in loops, so use `useHotkeys` for any list whose length can change:

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

The hook compares the array between renders by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
