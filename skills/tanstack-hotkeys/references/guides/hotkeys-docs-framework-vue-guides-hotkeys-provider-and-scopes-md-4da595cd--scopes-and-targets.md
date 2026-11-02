# Hotkeys Provider And Scopes — Scopes and targets

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

## Scopes and targets

A scope and a [target](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md) both limit when a hotkey works, and a hotkey can have both:

```vue
<!-- Editor.vue, rendered inside <HotkeysProvider scope="editor"> -->
<script setup lang="ts">
import { ref } from 'vue'
import { useHotkey } from '@tanstack/vue-hotkeys'

const outline = ref<HTMLElement | null>(null)

// In the 'editor' scope: works wherever focus is, while the scope is active
useHotkey('Mod+B', () => toggleBold())

// Also has a target: works only while focus is inside the outline
useHotkey('Delete', () => deleteHeading(), { target: outline })
</script>

<template>
  <nav ref="outline" tabindex="0">...</nav>
</template>
```

| | Scope | Target |
| --- | --- | --- |
| Decides | Whether the hotkey is on | Which key presses the hotkey receives |
| Based on | Which providers are mounted and enabled | Where focus is |
| Follows | The component tree, including teleports | The DOM |
| Set with | `HotkeysProvider scope`, `provideHotkeysContext`, or the `scope` option | The `target` option |
| Use for | Dialogs, panes, and tabs | Focusable elements, such as a list or a code editor |
