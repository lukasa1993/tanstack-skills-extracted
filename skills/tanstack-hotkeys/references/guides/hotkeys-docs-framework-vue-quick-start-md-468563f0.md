# Quick Start

<a id="source-hotkeys-docs-framework-vue-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.8.0`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md) page for instructions.

## Your First Hotkey

The `useHotkey` composable is the primary way to register keyboard shortcuts in Vue:

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => {
  saveDocument()
})
</script>

<template>
  <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
</template>
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common Patterns

### Multiple Hotkeys

```vue
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => save())
useHotkey('Mod+Z', () => undo())
useHotkey('Mod+Shift+Z', () => redo())
useHotkey('Mod+F', () => openSearch())
useHotkey('Escape', () => closeDialog())
</script>
```

### Scoped Hotkeys with Template Refs

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const panelRef = ref<HTMLDivElement | null>(null)

useHotkey('Escape', () => closePanel(), { target: panelRef })
</script>

<template>
  <div ref="panelRef" tabindex="0">
    <p>Press Escape while focused here to close</p>
  </div>
</template>
```

### Conditional Hotkeys

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const isOpen = ref(true)

useHotkey('Escape', () => {
  isOpen.value = false
}, { enabled: isOpen })
</script>
```

### Multi-Key Sequences

```vue
<script setup lang="ts">
import { useHotkeySequence } from '@tanstack/vue-hotkeys'

useHotkeySequence(['G', 'G'], () => scrollToTop())
useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
</script>
```

For several sequences or a list that changes at runtime, prefer a single `useHotkeySequences([...])` call (see the [Sequences guide](./hotkeys-docs-framework-vue-guides-sequences-md-9eb4426e.md#source-hotkeys-docs-framework-vue-guides-sequences-md)).

### Tracking Held Keys

```vue
<script setup lang="ts">
import { useHeldKeys, useKeyHold } from '@tanstack/vue-hotkeys'

const heldKeys = useHeldKeys()
const isShiftHeld = useKeyHold('Shift')
</script>

<template>
  <div class="status-bar">
    <span v-if="isShiftHeld">Shift mode active</span>
    <span v-if="heldKeys.length > 0">Keys: {{ heldKeys.join('+') }}</span>
  </div>
</template>
```

### Displaying Hotkeys in the UI

```vue
<script setup lang="ts">
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => save())
</script>

<template>
  <button>
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </button>
</template>
```

## Default Options Provider

Wrap part of your app with `HotkeysProvider` to set default options for all Vue composables in that subtree:

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { preventDefault: true },
      hotkeySequence: { timeout: 1500 },
      hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
    }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

## Next Steps

- [Hotkeys Guide](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md)
- [Sequences Guide](./hotkeys-docs-framework-vue-guides-sequences-md-9eb4426e.md#source-hotkeys-docs-framework-vue-guides-sequences-md)
- [Hotkey Recording Guide](./hotkeys-docs-framework-vue-guides-hotkey-recording-md-d5805b30.md#source-hotkeys-docs-framework-vue-guides-hotkey-recording-md)
- [Sequence Recording Guide](./hotkeys-docs-framework-vue-guides-sequence-recording-md-d1fba53e.md#source-hotkeys-docs-framework-vue-guides-sequence-recording-md)
- [Key State Tracking Guide](./hotkeys-docs-framework-vue-guides-key-state-tracking-md-aab0ffa7.md#source-hotkeys-docs-framework-vue-guides-key-state-tracking-md)
- [Formatting & Display Guide](./hotkeys-docs-framework-vue-guides-formatting-display-md-60ef242e.md#source-hotkeys-docs-framework-vue-guides-formatting-display-md)
