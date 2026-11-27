# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Register a hotkey

Pass a hotkey and callback to `useHotkey`:

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

Callbacks receive the `KeyboardEvent` and a context object:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The hook reads its callback and options on every render, so callbacks always see fresh props and state without a dependency array:

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // Always logs the latest count
  useHotkey('Mod+Shift+C', () => console.log(count))

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

Both the hotkey and its options can change between renders. Changing only options updates the existing registration in place. Changing the hotkey or `target` replaces the registration cleanly:

```tsx
function Editor({ saveHotkey, readOnly }: EditorProps) {
  useHotkey(saveHotkey, () => save(), { enabled: !readOnly })
}
```

That makes it straightforward to wire up user-chosen shortcuts from the [hotkey recorder](./hotkeys-docs-framework-react-guides-custom-hotkey-recording-md-376391c6.md#source-hotkeys-docs-framework-react-guides-custom-hotkey-recording-md) or centralized [App Hotkeys](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md).

### Optional hotkeys

Passing `undefined`, `null`, or `''` registers nothing, which works well for optional shortcut props. Switching to a falsy value unregisters the hotkey and hides any hints. Passing a valid hotkey again registers it again.

To keep the shortcut visible in devtools and cheat sheets while paused, leave the hotkey defined and pass `enabled: false` instead.

### Write a chord as a string or an object

Most chords are written as strings, giving you editor autocomplete and compile-time validation:

```tsx
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // Physical W position, regardless of layout

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod must come first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod already maps to Meta on macOS
```

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./hotkeys-docs-framework-react-guides-keyboard-layouts-md-3f63f616.md#source-hotkeys-docs-framework-react-guides-keyboard-layouts-md).

When building bindings from UI state, such as modifier checkboxes, use a `RawHotkeyChord` object instead:

```tsx
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  { key: binding.key, mod: binding.mod, shift: binding.shift },
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix of both:

```tsx
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

Internally, TanStack Hotkeys normalizes objects to canonical strings, so `context.hotkey` and devtools report `'Mod+Shift+S'` for `{ key: 'S', mod: true, shift: true }`. See [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for more on physical codes like `[KeyW]`.
