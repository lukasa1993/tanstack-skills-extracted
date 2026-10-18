# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S` |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) the hotkey belongs to |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains why each one was chosen and when to change it. The [`UseHotkeyOptions` reference](https://github.com/TanStack/hotkeys/blob/ad56a4b0dbf3c34d8552eca2cc88c5c7000d520a/docs/framework/vue/reference/type-aliases/UseHotkeyOptions.md) lists the types.

To change a default for every hotkey in your app, wrap it in a `HotkeysProvider` with `default-options`. Options passed to a composable override the provider's defaults:

```vue
<!-- App.vue -->
<script setup lang="ts">
import { HotkeysProvider } from '@tanstack/vue-hotkeys'
</script>

<template>
  <HotkeysProvider
    :default-options="{ hotkey: { requireReset: true, timeout: 1500 } }"
  >
    <AppContent />
  </HotkeysProvider>
</template>
```

The provider is optional. Without one, every hotkey uses the built-in defaults in the table. The defaults apply to components inside the provider, not to the component that renders it. See [HotkeysProvider and Scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) for nested defaults and for grouping hotkeys into scopes.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects options for the other kind:

```ts
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

Options that apply to many hotkeys at once, such as provider defaults, apply each of these to the matching kind only. In the provider example above, `requireReset` affects chords, and `timeout` affects sequences.

When the kind isn't known until runtime, such as a `Hotkey` loaded from settings, the composable accepts only the options that both kinds share.
