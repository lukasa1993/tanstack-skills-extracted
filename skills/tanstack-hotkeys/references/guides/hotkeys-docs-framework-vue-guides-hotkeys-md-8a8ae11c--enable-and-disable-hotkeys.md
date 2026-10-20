# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Enable and disable hotkeys

A hotkey is on while its component is mounted. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```vue
<!-- SettingsDialog.vue -->
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

const emit = defineEmits<{ close: [] }>()

// Registered only while the dialog is mounted
useHotkey('Escape', () => emit('close'))
</script>

<template>
  <div role="dialog">...</div>
</template>
```

For a condition that doesn't match a component, pass `enabled` as a ref or a getter:

```ts
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

A disabled hotkey stays registered, so devtools still list it, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the callback:

```ts
useHotkey('Mod+S', () => {
  if (!hasUnsavedChanges.value) return
  save()
})
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, use [scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays mounted, or suspend the rest of the page while a dialog is open.
