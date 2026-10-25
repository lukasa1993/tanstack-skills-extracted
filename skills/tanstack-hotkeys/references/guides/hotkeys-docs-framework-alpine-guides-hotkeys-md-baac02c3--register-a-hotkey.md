# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md) · Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

## Register a hotkey

Create an owner for the component's hotkeys with `createHotkeysScope`, register hotkeys in `init()`, and destroy the owner in `destroy()`:

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
```

Destroying the owner unregisters every hotkey it created. `createHotkeysScope` only creates an owner for registrations. It doesn't create a hotkey scope.

The callback receives the `KeyboardEvent` and a context object:

```ts
this.hotkeys.createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

A callback created in `init()` reads the component's state through `this`, so it always sees current values:

```ts
Alpine.data('counter', () => ({
  count: 0,
  hotkeys: createHotkeysScope(),
  init() {
    // Logs the current count, not the count when the component was created
    this.hotkeys.createHotkey('Mod+Shift+C', () => console.log(this.count))
  },
  destroy() {
    this.hotkeys.destroy()
  },
}))
```

The hotkey and its options can change too. Pass them as getters, and the owner follows the state they read. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```ts
this.hotkeys.createHotkey(
  () => this.saveHotkey,
  () => save(),
  () => ({ enabled: !this.readOnly }),
)
```

A plain options object is read once, so `{ enabled: !this.readOnly }` keeps the value from when `init()` ran.

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md-c4d635ad.md#source-hotkeys-docs-framework-alpine-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md).

### Use the `$hotkeys` magic

To register hotkeys from markup, install `hotkeysPlugin` and call the same functions on `$hotkeys`. See [Use the `$hotkeys` magic](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md) for the setup:

```html
<div x-data="{ count: 0 }" x-init="$hotkeys.createHotkey('Mod+S', () => count++)">
  Saved <span x-text="count"></span> times
</div>
```

The plugin destroys `$hotkeys` with its element. The rest of this guide uses an owner from `createHotkeysScope`.

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```ts
this.hotkeys.createHotkey('Escape', () => close())
this.hotkeys.createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
this.hotkeys.createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
this.hotkeys.createHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

this.hotkeys.createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
this.hotkeys.createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```ts
this.hotkeys.createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
this.hotkeys.createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

this.hotkeys.createHotkey(
  () => ({ key: this.binding.key, mod: this.binding.mod, shift: this.binding.shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```ts
this.hotkeys.createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

Every chord and sequence step registers as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
