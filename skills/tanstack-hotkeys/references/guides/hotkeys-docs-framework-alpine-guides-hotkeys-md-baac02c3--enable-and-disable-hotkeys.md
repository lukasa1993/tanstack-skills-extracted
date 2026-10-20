# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Enable and disable hotkeys

A hotkey is on from the component's `init()` until its `destroy()` destroys the owner. Most hotkeys need no other on and off logic, so put each one in the component it belongs to:

```ts
Alpine.data('settingsDialog', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    // Registered only while the dialog exists
    this.hotkeys.createHotkey('Escape', () => this.$dispatch('close'))
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<template x-if="isOpen">
  <div x-data="settingsDialog" role="dialog" @close="isOpen = false">...</div>
</template>
```

For a condition that doesn't match a component, pass `enabled` from a getter:

```ts
this.hotkeys.createHotkey('Mod+S', () => save(), () => ({
  enabled: this.hasUnsavedChanges,
}))
```

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses completely and doesn't call `preventDefault`. Pressing `Mod+S` while the hotkey above is disabled opens the browser's Save dialog. To keep the dialog closed, leave the hotkey enabled and return early from the callback:

```ts
this.hotkeys.createHotkey('Mod+S', () => {
  if (!this.hasUnsavedChanges) return
  save()
})
```

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays in the page, or suspend the rest of the page while a dialog is open. See [Add defaults and scopes](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md).
