# Vue Hotkeys

<a id="source-tanstack-vue-hotkeys"></a>

Published skill · `@tanstack/vue-hotkeys@0.16.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Hotkeys Core](./tanstack-hotkeys-core-62518e1a.md).

# TanStack Hotkeys in Vue

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { formatForDisplay, useHotkey } from '@tanstack/vue-hotkeys'

const isDirty = ref(false)
const panel = ref<HTMLDivElement | null>(null)

useHotkey('Mod+S', () => save(), { enabled: isDirty })
useHotkey('Escape', () => closePanel(), { target: panel })
</script>

<template>
  <div ref="panel" tabindex="0" @input="isDirty = true">
    Save <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
  </div>
</template>
```

## API

| API                                       | What it's for                                                                                                                          |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `useHotkey(hotkey, callback, options?)`   | Register one chord, sequence, or app hotkey while the component is mounted; the hotkey and options can be refs or getters.             |
| `useHotkeys(definitions, commonOptions?)` | Register several hotkeys, or a ref or getter of a list built from data, in one call.                                                   |
| `<HotkeysProvider>`                       | Set default options, a scope (`exclusive` for dialogs), `enabled`, and app hotkeys for its children, and emit `custom-hotkeys-change`. |
| `provideHotkeysContext(options)`          | Provide the same options from a component's setup instead of rendering `HotkeysProvider`; they apply to its children.                  |
| `useHotkeysContext()`                     | Read the nearest provider's merged defaults and enabled state, or `null` outside a provider.                                           |
| `useDefaultHotkeysOptions()`              | Read the default options merged from every provider above.                                                                             |
| `useAppHotkeys()`                         | Get a computed ref of the declared app hotkeys with the user's custom hotkeys applied.                                                 |
| `useAppHotkeyList()`                      | Get a computed ref listing every app hotkey with its status, for a cheat sheet or settings screen.                                     |
| `useCustomHotkeys()`                      | Read, change, and reset the user's custom hotkeys, and check a new one for conflicts.                                                  |
| `useHotkeyRecorder(options)`              | Record a chord or sequence the user presses; destructure the refs it returns.                                                          |
| `useHotkeyRegistrations()`                | Get a ref listing every registered hotkey with its options and `meta`.                                                                 |
| `useHotkeyHint(hotkey, options?)`         | Get a computed ref of whether held modifiers should reveal a shortcut's hint.                                                          |
| `useKeyHold(key)`                         | Get a ref of whether one key is held.                                                                                                  |
| `useHeldKeys()`                           | Get a ref of every key that's held right now.                                                                                          |
| `useHeldKeyCodes()`                       | Get a ref mapping each held key to its physical `event.code`.                                                                          |

The package also re-exports `@tanstack/hotkeys`, such as `formatForDisplay`, `matchesKeyboardEvent`, and `defineAppHotkeys`.

No provider is required. Call the composables synchronously in setup.

## Pitfalls

- **Pass the ref, not `.value`.** `{ enabled: isDirty.value }` is read once, so the hotkey never turns on, and `{ target: panel.value }` is `null` in setup, so the hotkey never registers. Pass `isDirty` and `panel`. `enabled` and `target` accept refs and getters; for other options that depend on state, pass a getter for the whole options object.
- **Put the provider around the dialog component.** A `HotkeysProvider` in a component's own template, or `provideHotkeysContext` in its own setup, applies only to its children. Register the dialog's hotkeys in a child component, and give each open dialog its own scope name, such as `` `dialog-${useId()}` ``.
- **Destructure the recorder.** Templates unwrap only top-level refs, so `v-if="recorder.isRecording"` is always true. Use `const { isRecording, startRecording } = useHotkeyRecorder(...)`.
- **The callback isn't tracked.** Read refs and props inside it.
- **Call the composables directly.** A `useShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, reactive options, and app hotkeys.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Vue](../assets/tanstack-vue-hotkeys/references/app-hotkeys.md).

## API discovery and docs

Signatures: `node_modules/@tanstack/vue-hotkeys/dist/*.d.ts`. Guides: `https://tanstack.com/hotkeys/latest/docs/framework/vue/guides/<page>.md`, such as `hotkeys`, `hotkeys-provider-and-scopes`, or `app-hotkeys`. Devtools: `HotkeysDevtoolsPanel` from `@tanstack/vue-hotkeys-devtools`.
