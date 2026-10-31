# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. To listen on an element, attach the `onHotkey` modifier to it:

```gts
import Component from '@glimmer/component'
import { onHotkey } from '@tanstack/ember-hotkeys'

export default class Panel extends Component {
  close = () => closePanel()

  <template>
    {{! Fires only while the panel, or something inside it, has focus }}
    <div tabindex="0" {{onHotkey 'Escape' this.close}}>Panel content</div>
  </template>
}
```

The modifier registers the hotkey when the element renders and unregisters it when the element is removed. `onHotkeys` does the same for an array of hotkeys. The `useHotkey` and `useHotkeys` helpers also accept a `target` named argument, such as `window` from a component property.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence on an element advances only on key presses inside the element.

### A target is not a scope

A target and a scope both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use an element target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both. See [Add defaults and scopes](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md).
