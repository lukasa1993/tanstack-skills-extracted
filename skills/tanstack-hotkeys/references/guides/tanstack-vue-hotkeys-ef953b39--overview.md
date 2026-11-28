# Vue Hotkeys — Overview

[Guide and prerequisites](./tanstack-vue-hotkeys-ef953b39.md) · Published skill · `@tanstack/vue-hotkeys@0.27.0`.

# TanStack Hotkeys in Vue

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```vue
<script setup lang="ts">
import { useFormatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'
import { ref } from 'vue'

const isDirty = ref(false)
const panel = ref<HTMLDivElement | null>(null)

useHotkey('Mod+S', () => save(), { enabled: isDirty })
useHotkey('Escape', () => closePanel(), { target: panel })
const formatForDisplay = useFormatForDisplay()
</script>

<template>
  <div ref="panel" tabindex="0" @input="isDirty = true">
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </div>
</template>
```
