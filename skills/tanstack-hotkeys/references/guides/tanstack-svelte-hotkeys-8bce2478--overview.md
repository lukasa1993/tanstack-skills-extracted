# Svelte Hotkeys — Overview

[Guide and prerequisites](./tanstack-svelte-hotkeys-8bce2478.md) · Published skill · `@tanstack/svelte-hotkeys@0.27.0`.

# TanStack Hotkeys in Svelte

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```svelte
<script lang="ts">
  import {
    createHotkey,
    createHotkeyAttachment,
  } from '@tanstack/svelte-hotkeys'

  let isDirty = $state(false)

  createHotkey(
    'Mod+S',
    () => save(),
    () => ({ enabled: isDirty }),
  )
  const closeOnEscape = createHotkeyAttachment('Escape', () => closePanel())
</script>

<div tabindex="0" {@attach closeOnEscape} oninput={() => (isDirty = true)}>
  Panel
</div>
```
