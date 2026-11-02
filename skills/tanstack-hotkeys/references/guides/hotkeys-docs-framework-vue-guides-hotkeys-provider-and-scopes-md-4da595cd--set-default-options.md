# Hotkeys Provider And Scopes — Set default options

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.24.0`.

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

- `hotkey` defaults apply to every `useHotkey` and `useHotkeys` inside the provider. `requireReset` applies to chords, and `timeout` to sequences. Options passed to a composable override the defaults. See [Hotkey options](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md).
- `hotkeyRecorder` defaults apply to every `useHotkeyRecorder` inside the provider. See [Custom Hotkey Recording](./hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md-c0532132.md#source-hotkeys-docs-framework-vue-guides-custom-hotkey-recording-md).

A nested provider merges its defaults over its parent's, so a provider deeper in the tree can change the defaults for one part of your app.
