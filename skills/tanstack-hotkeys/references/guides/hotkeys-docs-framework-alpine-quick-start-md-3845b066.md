# Quick Start

<a id="source-hotkeys-docs-framework-alpine-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

[Topic index](../framework-alpine.md) · [Source provenance](../SOURCES.md)

This guide adds keyboard shortcuts to Alpine components. If you haven't installed TanStack Hotkeys yet, see [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md).

## Register a hotkey

TanStack Hotkeys needs no app-wide setup. In each component, create an owner for its hotkeys with `createHotkeysScope`, register the hotkeys in `init()`, and destroy the owner in `destroy()`:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(),
  init() {
    this.hotkeys.createHotkey('Mod+S', () => saveDocument())
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))

Alpine.start()
```

```html
<div x-data="editor">
  <textarea></textarea>
</div>
```

Destroying the owner unregisters every hotkey it created. The adapter runs in the browser, so with server rendering, load it only on the client.

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults.

That's all a hotkey needs. Shared defaults, scopes, and the other features later in this guide are optional, so add them as your app grows.

### Use the `$hotkeys` magic

To register hotkeys from markup, install `hotkeysPlugin` before `Alpine.start()`:

```ts
import Alpine from 'alpinejs'
import { hotkeysPlugin } from '@tanstack/alpine-hotkeys'

Alpine.plugin(hotkeysPlugin)
Alpine.start()
```

```html
<div x-data="{ count: 0 }" x-init="$hotkeys.createHotkey('Mod+S', () => count++)">
  Saved <span x-text="count"></span> times
</div>
```

`$hotkeys` is an owner that the plugin destroys with its element. It uses the built-in defaults. Register each hotkey with either `$hotkeys` or your own owner, not both.

## Register several hotkeys

When a component has more than one hotkey, register them together with `createHotkeys`:

```ts
init() {
  this.hotkeys.createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ])
},
```

`createHotkeys` also accepts a getter that returns the array, so the list can come from Alpine state and change length over time.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
this.hotkeys.createHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`createHotkeys` accepts chords and sequences in the same array:

```ts
this.hotkeys.createHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, formatForDisplay } from '@tanstack/alpine-hotkeys'
import type { HotkeyChord } from '@tanstack/alpine-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

Alpine.data('saveButton', () => ({
  hotkeys: createHotkeysScope(),
  label: formatForDisplay(saveHotkey),
  init() {
    this.hotkeys.createHotkey(saveHotkey, () => saveDocument())
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

```html
<button x-data="saveButton" type="button">
  Save <kbd x-text="label"></kbd>
</button>
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered in the component's `init()`, and unregistered when the component's `destroy()` destroys its owner. Put each hotkey in the component it belongs to, so it is active only while that component exists:

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
<div x-data="{ isOpen: false }">
  <button type="button" @click="isOpen = true">Settings</button>
  <template x-if="isOpen">
    <div x-data="settingsDialog" role="dialog" @close="isOpen = false">...</div>
  </template>
</div>
```

For a condition that doesn't match a component, pass `enabled`. Pass options as a getter, so they follow Alpine state:

```ts
this.hotkeys.createHotkey('Mod+S', () => save(), () => ({
  enabled: this.hasUnsavedChanges,
}))
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add defaults and scopes](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#add-defaults-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, pass that element as `target`:

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
  <div x-ref="panel" tabindex="0">...</div>
</div>
```

A `null` target waits until the element exists. The element must be focusable to receive key presses, so give it a `tabindex` if it isn't a control.

## Add defaults and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component exists.

Alpine has no provider, so pass default options to `createHotkeysScope`. Define them once and share them between components that need the same defaults:

```ts
const hotkeyDefaults = { hotkey: { timeout: 1500 } }

Alpine.data('editor', () => ({
  hotkeys: createHotkeysScope(hotkeyDefaults),
  // ...
}))
```

Hotkeys can also be grouped into scopes. Every hotkey in a scope turns on and off with it. Make a scope `exclusive`, and while it is active, only its hotkeys work. Use one for dialogs and popups that should own the keyboard.

Activate the scope from the hotkey manager in `init()`, release it in `destroy()`, and pass `scope` to the hotkeys that belong to it:

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope, getHotkeyManager } from '@tanstack/alpine-hotkeys'

Alpine.data('confirmDialog', () => {
  const hotkeys = createHotkeysScope()
  let releaseScope = () => {}

  return {
    init() {
      releaseScope = getHotkeyManager().activateScope('confirm-dialog', {
        exclusive: true,
      })
      hotkeys.createHotkeys(
        [
          { hotkey: 'Enter', callback: () => this.$dispatch('confirm') },
          { hotkey: 'Escape', callback: () => this.$dispatch('cancel') },
        ],
        { scope: 'confirm-dialog' },
      )
    },
    destroy() {
      releaseScope()
      hotkeys.destroy()
    },
  }
})
```

While the dialog exists, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog is destroyed, they work again.

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released. Despite its name, `createHotkeysScope` only creates an owner for registrations. It doesn't create or activate a hotkey scope.

## Next steps

Learn more about the basics:

- [Hotkeys](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#source-hotkeys-docs-framework-alpine-guides-hotkeys-md): chords and sequences, options, and element hotkeys
- [Sequences](./hotkeys-docs-framework-alpine-guides-sequences-md-037f4bfb.md#source-hotkeys-docs-framework-alpine-guides-sequences-md): Vim-style multi-key shortcuts
- [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md#source-hotkeys-docs-framework-alpine-guides-formatting-display-md): labels and keycaps for every platform
- [Held Key State Helpers](./hotkeys-docs-framework-alpine-guides-held-key-state-helpers-md-45f4cbc6.md#source-hotkeys-docs-framework-alpine-guides-held-key-state-helpers-md): show which keys are held
- [Hotkey Hints](./hotkeys-docs-framework-alpine-guides-hotkey-hints-md-91910f46.md#source-hotkeys-docs-framework-alpine-guides-hotkey-hints-md): show a button's shortcut while the user holds its modifiers

As your app grows:

- [App Hotkeys](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./hotkeys-docs-framework-alpine-guides-cheat-sheet-ui-helpers-md-c2bc3613.md#source-hotkeys-docs-framework-alpine-guides-cheat-sheet-ui-helpers-md): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md#source-hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md): record the shortcut a user presses
- [Hotkey Manager](./hotkeys-docs-framework-alpine-guides-hotkey-manager-md-37a873d6.md#source-hotkeys-docs-framework-alpine-guides-hotkey-manager-md): register and inspect hotkeys outside components
