# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

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

Toggling `enabled` keeps the hotkey registered and visible in devtools without registering it again. While disabled, it lets the browser handle the key, so `Mod+S` opens the Save Page dialog. To keep blocking the browser action while disabled or suspended, set `preventDefault: 'always'`:

```ts
useHotkey('Mod+S', () => save(), {
  enabled: hasUnsavedChanges,
  preventDefault: 'always',
})
```

See [Hotkeys that can't fire leave the key alone](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for when to avoid `'always'`, such as clipboard chords, single keys behind an accessibility switch, and `Tab`.

> [!NOTE]
> Single-key shortcuts such as `K` need a user setting to turn them off or remap them for accessibility. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). To toggle a group of shortcuts together, use [scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) instead of passing `enabled` to each hotkey.
