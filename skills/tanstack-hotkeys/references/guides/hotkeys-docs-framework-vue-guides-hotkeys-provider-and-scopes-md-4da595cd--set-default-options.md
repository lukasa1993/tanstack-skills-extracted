# Hotkeys Provider And Scopes — Set default options

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Set default options

Pass `defaultOptions` to change the defaults for everything inside the provider:

```vue
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{
      hotkey: { requireReset: true, timeout: 1500 },
      hotkeyRecorder: { idleTimeoutMs: 2000 },
    }"
  >
    <App />
  </HotkeysProvider>
</template>
```

- **`hotkey`.** Sets defaults for every `useHotkey` and `useHotkeys` in the provider (`requireReset` applies to chords, and `timeout` applies to sequences). Options passed to a hotkey override these defaults. See [Hotkey options](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md).
- **`hotkeyRecorder`.** Sets defaults for every `useHotkeyRecorder` in the provider. See [Hotkey Recording](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md#source-hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md).
- **`keyboardLayout: false`.** Stops labels from asking the browser for the user's keyboard layout. See [Label physical keys for the user's keyboard](./hotkeys-docs-framework-vue-guides-formatting-display-md-60ef242e.md#source-hotkeys-docs-framework-vue-guides-formatting-display-md).

A nested provider merges its defaults over its parent's, so a provider deeper in the tree can change the defaults for one part of your app.
