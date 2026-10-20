# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Register a hotkey

Call `createHotkey` with a hotkey and a callback:

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

The callback receives the `KeyboardEvent` and a context object:

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

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md-bc85dc89.md#source-hotkeys-docs-framework-solid-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-solid-guides-app-hotkeys-md-acd9069d.md#source-hotkeys-docs-framework-solid-guides-app-hotkeys-md).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```tsx
createHotkey('Escape', () => close())
createHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
createHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
createHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

createHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
createHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```tsx
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
createHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

createHotkey(
  () => ({ key: binding().key, mod: binding().mod, shift: binding().shift }),
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```tsx
createHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The primitive registers every chord and sequence step as a string, so `context.hotkey` and devtools show `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
