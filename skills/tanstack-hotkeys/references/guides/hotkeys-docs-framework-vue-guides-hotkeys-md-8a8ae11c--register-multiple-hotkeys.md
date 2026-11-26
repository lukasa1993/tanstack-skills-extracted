# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register multiple hotkeys

Use `useHotkeys` to register an array of `{ hotkey, callback, options? }` entries in one call:

```vue
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Enter', callback: () => publish() },
  { hotkey: 'Mod+D', callback: () => duplicate() },
  { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
])
</script>
```

Chords and sequences can share the same array, and each item's `options` are typed against its own `hotkey`. Inside the array, `context` can belong to either kind, so check `context.kind` before reading `context.parsedChord`:

```ts
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

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkeys } from '@tanstack/vue-hotkeys'

const editor = ref<HTMLDivElement | null>(null)

useHotkeys(
  [
    { hotkey: 'Mod+B', callback: () => toggleBold() },
    { hotkey: 'Mod+I', callback: () => toggleItalic() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: canUndo } },
  ],
  { target: editor },
)
</script>

<template>
  <div ref="editor" contenteditable />
</template>
```

The shared `target` makes all three hotkeys listen on the editor only. [Hotkey targets](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#hotkey-targets) explains targets.

Options merge in three layers: defaults from the provider first, then the shared options, then per-item options.

### Build the list from data

`setup` runs once, so a plain array never changes after it registers. Pass a getter or a computed ref for any list whose length can change:

```vue
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

const props = defineProps<{ items: Array<MenuItem> }>()

useHotkeys(() =>
  props.items.map((item) => ({
    hotkey: item.shortcut,
    callback: item.action,
    options: { enabled: item.enabled },
  })),
)
</script>
```

The composable compares the array each time it changes, by position and hotkey. It registers new hotkeys and unregisters removed ones. Reordering the array registers the moved hotkeys again.
