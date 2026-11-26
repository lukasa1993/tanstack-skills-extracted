# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register a hotkey

Pass a hotkey and callback to `createHotkey`:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

Callbacks receive the `KeyboardEvent` and a context object:

```tsx
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

Solid runs a component once, and the callback reads signals and props when it runs, so it always sees their current values:

```tsx
import { createSignal } from 'solid-js'

function Counter() {
  const [count, setCount] = createSignal(0)

  // Logs the current count, not the count from the first render
  createHotkey('Mod+Shift+C', () => console.log(count()))

  return <button onClick={() => setCount(count() + 1)}>Count: {count()}</button>
}
```

The hotkey and its options can change too. Pass them as accessors, and the primitive follows the signals and props they read. When only the options change, it updates the existing registration. When the hotkey or its `target` changes, it replaces the registration:

```tsx
function Editor(props: EditorProps) {
  createHotkey(
    () => props.saveHotkey,
    () => save(),
    () => ({ enabled: !props.readOnly }),
  )

  return <textarea />
}
```

A plain options object is read once, so `{ enabled: !props.readOnly }` keeps the value from when the component ran. An object with getters, such as `{ get enabled() { return !props.readOnly } }`, follows changes like an accessor does.

This pattern wires up user-chosen shortcuts from the [hotkey recorder](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md#source-hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md) or centralized [App Hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which works well for optional shortcut props. Switching to a falsy value unregisters the hotkey and hides any hints. Passing a valid hotkey again registers it again.

To keep the shortcut visible in devtools and cheat sheets while paused, leave the hotkey defined and pass `enabled: false` instead.

### Register after an `await`

A hotkey unregisters when the component or reactive scope that created it is cleaned up. Solid knows that scope only while the component is being created, so call `createHotkey` directly in the component, not after an `await` or in a timer. A hotkey created there has no owner, and it keeps firing after the component unmounts.

When the hotkey needs something that loads later, register it right away, read the loaded value in the callback, and keep the hotkey disabled until the value is there. A disabled hotkey leaves the key to the browser:

```tsx
import { createResource } from 'solid-js'
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  const [commands] = createResource(loadCommands)

  createHotkey(
    'Mod+S',
    () => commands()?.save(),
    () => ({ enabled: !!commands() }),
  )

  return <textarea />
}
```

To create a hotkey later, capture `getOwner()` while the component is created and make the call inside `runWithOwner`. Skip the call if the component was already cleaned up.

### Write a chord as a string or an object

Most chords are written as strings, giving you editor autocomplete and compile-time validation:

```tsx
createHotkey('Escape', () => close())
createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Order: Mod or Control, Alt, Shift, Meta
createHotkey('[KeyW]', () => moveUp()) // Physical W position, regardless of layout

createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod must come first
createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod already maps to Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./hotkeys-docs-framework-solid-guides-keyboard-layouts-md-9cc5d7a6.md#source-hotkeys-docs-framework-solid-guides-keyboard-layouts-md).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```tsx
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

createHotkey(
  () => ({ key: binding().key, mod: binding().mod, shift: binding().shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```tsx
createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

Internally, TanStack Hotkeys normalizes objects to canonical strings, so `context.hotkey` and devtools report `'Mod+Shift+S'` for `{ key: 'S', mod: true, shift: true }`. See [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for more on physical codes like `[KeyW]`.
