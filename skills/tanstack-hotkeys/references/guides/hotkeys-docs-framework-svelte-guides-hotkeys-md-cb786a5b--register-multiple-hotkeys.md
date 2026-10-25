# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `createHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])
</script>
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `createHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

```ts
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

Pass options for every definition as the second argument. A definition's own options override them. This editor's formatting hotkeys toggle, so they share `requireReset: true` to fire once per press, while undo keeps repeating:

```svelte
<script lang="ts">
  import { createHotkeysAttachment } from '@tanstack/svelte-hotkeys'

  const editorHotkeys = createHotkeysAttachment(
    [
      { hotkey: 'Mod+B', callback: () => toggleBold() },
      { hotkey: 'Mod+I', callback: () => toggleItalic() },
      { hotkey: 'Mod+Z', callback: () => undo(), options: { requireReset: false } },
    ],
    { requireReset: true },
  )
</script>

<div contenteditable {@attach editorHotkeys}></div>
```

The attachment also makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#hotkey-targets) explains attachments.

Options merge in this order: provider defaults, then the shared options, then each definition's options.

### Build the list from data

The script runs once, so a plain array never changes after it registers. Pass a getter for any list whose length can change:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  let { items }: { items: Array<MenuItem> } = $props()

  createHotkeys(() =>
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
</script>
```

The function compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
