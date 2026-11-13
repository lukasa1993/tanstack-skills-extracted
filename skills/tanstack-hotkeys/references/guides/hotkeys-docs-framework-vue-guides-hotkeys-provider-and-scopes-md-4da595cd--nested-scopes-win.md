# Hotkeys Provider And Scopes — Nested scopes win

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Nested scopes win

When hotkeys in two active scopes match the same key, only one scope handles it:

- A nested scope beats the scopes it is nested in.
- Otherwise, the scope that activated most recently wins.

Every hotkey in the winning scope that matches the key runs. Hotkeys in other scopes do not.

```vue
<!-- DocumentView.vue, rendered inside <HotkeysProvider scope="document"> -->
<script setup lang="ts">
import { HotkeysProvider, useHotkey } from '@tanstack/vue-hotkeys'

useHotkey('Mod+S', () => saveDocument())
</script>

<template>
  <HotkeysProvider scope="comments">
    <!-- CommentBox registers Mod+S too, and wins while mounted -->
    <CommentBox />
  </HotkeysProvider>
</template>
```

When the comment box unmounts, `Mod+S` saves the document again.

Precedence compares hotkeys on the same [`target`](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md). A hotkey bound to an element still handles events from inside that element before document hotkeys do, as long as its scope is active.

Two registrations of the same hotkey in different scopes are not a conflict, so `conflictBehavior` does not warn about them.
