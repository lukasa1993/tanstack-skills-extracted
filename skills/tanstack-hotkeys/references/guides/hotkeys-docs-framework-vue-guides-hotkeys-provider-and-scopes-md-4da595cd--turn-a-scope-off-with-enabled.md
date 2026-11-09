# Hotkeys Provider And Scopes — Turn a scope off with `enabled`

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

## Turn a scope off with `enabled`

Bind `enabled` to deactivate a provider's scope while it stays mounted. This suits tabs, carousels, and split views that keep inactive panes rendered:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { HotkeysProvider } from '@tanstack/vue-hotkeys'

const current = ref('inbox')
</script>

<template>
  <HotkeysProvider
    v-for="name in folders"
    :key="name"
    :scope="name"
    :enabled="current === name"
  >
    <!-- FolderPane calls useHotkey('Alt+N', ...). Only the current folder's handler runs. -->
    <FolderPane :name="name" />
  </HotkeysProvider>
</template>
```

`FolderPane` doesn't know which folder is current. Without scopes, each pane would need an `enabled` option on every hotkey it registers.

`enabled` is inherited. Disabling a provider also deactivates every scope nested in it. A provider without its own `scope` has no scope to deactivate, so disabling it affects only the scoped providers inside it.

Hotkeys in an inactive scope stay registered. Devtools list them under their inactive scope, and [`useAppHotkeyList`](./hotkeys-docs-framework-vue-guides-cheat-sheet-ui-helpers-md-fb272afb.md#source-hotkeys-docs-framework-vue-guides-cheat-sheet-ui-helpers-md) reports their app hotkeys as `'suspended'`.

### Pages cached by `<KeepAlive>`

A page cached by `<KeepAlive>` stops its hotkeys while it is hidden. Its hotkeys unregister, and its providers release their scopes, so a cached dialog's exclusive scope doesn't block the visible page. When the page shows again, its hotkeys and scopes come back. Recorders on a hidden page stop recording.

This also applies to `<RouterView>` and `<NuxtPage keepalive>` pages that use `<KeepAlive>`.
