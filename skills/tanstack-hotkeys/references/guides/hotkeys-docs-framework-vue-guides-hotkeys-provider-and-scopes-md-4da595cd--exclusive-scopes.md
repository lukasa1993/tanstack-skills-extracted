# Hotkeys Provider And Scopes — Exclusive scopes

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Exclusive scopes

An exclusive scope suspends every other scope while it is active, including `'global'`. Use it for dialogs, menus, and other overlays that should own the keyboard:

```vue
<!-- EditDialog.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider scope="edit-dialog" exclusive>
    <Teleport to="body">
      <!-- DialogBody registers Escape to close and Mod+S to save -->
      <DialogBody />
    </Teleport>
  </HotkeysProvider>
</template>
```

While the dialog is open, `Mod+S` saves the dialog and nothing else, even though the page behind it registers `Mod+S` too. Scopes nested inside the exclusive provider keep working, so the dialog can still be built from scoped components.

A scope follows the component tree, not the DOM. The `Teleport` above renders into `document.body`, but its hotkeys still belong to `edit-dialog`.

### Allow other scopes

Pass `{ allow }` to keep some scopes working while an exclusive scope is active:

```vue
<HotkeysProvider
  scope="edit-dialog"
  :exclusive="{ allow: ['global', 'command-palette'] }"
>
  <DialogBody />
</HotkeysProvider>
```

- An allowed scope still has to be active on its own. Only `'global'` is always active.
- Allowed scopes follow the usual precedence. A popover that opens over the dialog in an allowed scope is newer, so its `Escape` closes the popover first.
- The `allow` array can be written inline. Providers compare it by value, so a new array on each render does not reactivate the scope.

### Stacked exclusive scopes

When more than one exclusive scope is active, the one with the highest precedence owns the keyboard, and only its `allow` list applies. A confirmation dialog opened from inside an edit dialog suspends the edit dialog until it closes.

Each exclusive scope needs a unique name. Activating the same exclusive scope twice logs a warning in development, because hotkeys from both providers would fire together.
