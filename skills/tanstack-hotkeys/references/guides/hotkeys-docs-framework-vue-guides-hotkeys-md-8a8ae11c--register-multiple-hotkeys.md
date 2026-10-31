# Hotkeys — Register multiple hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Register multiple hotkeys

When a component has more than one hotkey, use `useHotkeys`. It takes an array of definitions, each with a `hotkey`, a `callback`, and optional `options`:

```vue
<script setup lang="ts">
import { useHotkeys } from '@tanstack/vue-hotkeys'

useHotkeys([
  { hotkey: 'Mod+S', callback: () => save() },
  { hotkey: 'Mod+Z', callback: () => undo() },
  { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
])
</script>
```

Chords and sequences can share one array. Each definition's `options` are typed by its `hotkey`, as they are for `useHotkey`.

A callback in the array receives a `context` that can belong to either kind of hotkey. Check `context.kind` before reading `context.parsedChord`:

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

Pass options for every definition as the second argument. A definition's own options override them:

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

Options merge in this order: provider defaults, then the shared options, then each definition's options.

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
