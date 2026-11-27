# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) the hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#describe-hotkeys-with-meta). |

See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for why each default behaves the way it does, and the [`UseHotkeyOptions` reference](https://github.com/TanStack/hotkeys/blob/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/docs/framework/vue/reference/type-aliases/UseHotkeyOptions.md) for type definitions.

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

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#source-hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```ts
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

When defaults apply to many hotkeys at once, `requireReset` affects only chords and `timeout` affects only sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only the options common to both kinds are accepted.
