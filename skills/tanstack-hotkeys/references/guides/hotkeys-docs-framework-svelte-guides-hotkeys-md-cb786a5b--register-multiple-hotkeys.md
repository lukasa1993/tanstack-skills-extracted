# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register multiple hotkeys

Use `createHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```svelte
<script lang="ts">
  import { createHotkeys } from '@tanstack/svelte-hotkeys'

  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
    { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
  ])
</script>
```

Chords and sequences can share the same array, and each item's `options` are typed against its own `hotkey`. Inside the array, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

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

Pass shared options as the second argument. Individual definitions override them:

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

Options merge in three layers: defaults from the provider first, then the shared options, then per-item options.

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
