# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, `document`, or `window` to listen somewhere else. Pass the options as a getter, so the hotkey finds the element after Alpine creates it:

```ts
Alpine.data('panel', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    // Fires only while the panel, or something inside it, has focus
    this.hotkeys.createHotkey('Escape', () => closePanel(), () => ({
      target: this.$refs.panel,
    }))
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<div x-data="panel">
  <div x-ref="panel" tabindex="0">Panel content</div>
</div>
```

`$refs` holds elements that exist when `init()` runs. For an element that Alpine adds later, such as one inside `x-if`, keep the element in component state and return it from the getter. A `null` target waits until the element exists.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a scope both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both. See [Add defaults and scopes](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md).
