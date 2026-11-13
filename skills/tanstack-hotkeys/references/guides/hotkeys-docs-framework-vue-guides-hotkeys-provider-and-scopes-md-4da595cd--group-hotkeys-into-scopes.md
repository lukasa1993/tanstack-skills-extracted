# Hotkeys Provider And Scopes — Group hotkeys into scopes

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Group hotkeys into scopes

Apps reuse keys. `Escape` should close the dialog, not the panel behind it, and `Mod+S` should post the comment you are typing, not save the whole document. You could pass [`enabled`](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md) to every hotkey, but then each component has to know about every other component that might want the same key.

Scopes group hotkeys by where they render instead. Wrap part of your tree in a `HotkeysProvider` with a `scope`, and every hotkey registered inside it belongs to that scope. The scope is active while the provider is mounted and enabled, and nested scopes take precedence over the scopes around them.

```vue
<!-- App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider>
    <Toolbar />
    <HotkeysProvider scope="editor">
      <Editor />
    </HotkeysProvider>
  </HotkeysProvider>
</template>
```

```vue
<!-- Editor.vue -->
<script setup lang="ts">
import { useHotkey } from '@tanstack/vue-hotkeys'

// Registered in the 'editor' scope
useHotkey('Mod+B', () => toggleBold())
</script>
```

A hotkey registered with `useHotkey` or `useHotkeys` uses the scope of the nearest provider that sets one. Hotkeys outside any scoped provider, including those under the root provider, are in the `'global'` scope, which is always active. A provider without `scope` uses its parent's scope.

To give a component's children a scope without adding `HotkeysProvider` to its template, call `provideHotkeysContext` in its setup. It takes the same options as the provider's props, and `scope`, `exclusive`, and `enabled` accept refs and getters:

```vue
<!-- EditorPane.vue -->
<script setup lang="ts">
import { provideHotkeysContext } from '@tanstack/vue-hotkeys'

const props = defineProps<{ active: boolean }>()

provideHotkeysContext({ scope: 'editor', enabled: () => props.active })
</script>

<template>
  <!-- Editor's hotkeys are in the 'editor' scope -->
  <Editor />
</template>
```

Like Vue's `provide`, it applies to the component's children, not to the component itself. A hotkey registered in the same setup as `provideHotkeysContext` uses the scope above it, so register the scope's hotkeys in a child component.

Scopes are names, not instances. Two mounted providers with `scope="editor"` share one scope, and it stays active until both unmount. Give each region its own name when you need to turn them on and off separately.
