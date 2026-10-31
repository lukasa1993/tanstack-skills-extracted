# Hotkeys — Enable and disable hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

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

A disabled hotkey stays registered, and changing `enabled` doesn't register it again. While disabled, it ignores key presses, so pressing `Mod+S` opens the browser's Save dialog. To keep the dialog closed, set `preventDefault: 'always'`:

```ts
this.hotkeys.createHotkey('Mod+S', () => save(), () => ({
  enabled: this.hasUnsavedChanges,
  preventDefault: 'always',
}))
```

With `'always'`, a hotkey that can't fire, because it's disabled or its scope is inactive or suspended, still prevents the browser's action. It doesn't stop propagation, and when another hotkey handles the key, that hotkey's options apply instead. Sequences treat `'always'` as `true`. To apply it to every hotkey, set it in the default options. We recommend it for most hotkeys, but not for hotkeys you turn off to hand the key back to the browser, such as `Mod+C` or `Tab`. See [Hotkeys that can't fire leave the key alone](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

`enabled` works the same way for sequences. A disabled sequence ignores its steps.

Single-key hotkeys, such as `K`, need a setting that lets users turn them off. Pass that setting as `enabled`. See [Single-key shortcuts need an off switch](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

When a group of hotkeys turns on and off together, put them in a scope instead of passing `enabled` to each one. A scope can turn off the hotkeys in a tab panel that stays in the page, or suspend the rest of the page while a dialog is open. See [Add defaults and scopes](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md).
