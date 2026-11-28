# Alpine Hotkeys — Overview

[Guide and prerequisites](./tanstack-alpine-hotkeys-b9b64077.md) · Published skill · `@tanstack/alpine-hotkeys@0.17.0`.

# TanStack Hotkeys in Alpine

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts no-check
import { createHotkeysScope, hotkeysPlugin } from '@tanstack/alpine-hotkeys'
import Alpine from 'alpinejs'

Alpine.plugin(hotkeysPlugin) // before Alpine.start()

Alpine.data('panel', () => ({
  dirty: false,
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkey(
      'Mod+S',
      () => save(),
      () => ({ enabled: this.dirty }),
    )
    this.hotkeys.createHotkey(
      'Escape',
      () => closePanel(),
      () => ({ target: this.$refs.panel }),
    )
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

Install `Alpine.plugin(hotkeysPlugin)` before `Alpine.start()`. It gives the adapter the app's Alpine instance; without it, the adapter falls back to `window.Alpine` and throws when neither exists. The plugin also adds the `$hotkeys` magic for markup-only components, which is destroyed with its element: `x-init="$hotkeys.createHotkey('Mod+S', () => save())"`.

For a fixed hotkey in markup, import `hotkeyDirective` from `@tanstack/alpine-hotkeys`, install `Alpine.plugin(hotkeyDirective)`, and write `x-hotkey.mod.s="save()"`. Modifiers name the hotkey in lowercase, with dashes for multi-word keys (`x-hotkey.arrow-up`), and `x-hotkey.g.h` is a sequence. The expression gets `$event`. The directive uses the built-in options, and it lives as long as its attribute, so it follows Livewire and `Alpine.morph` updates.
