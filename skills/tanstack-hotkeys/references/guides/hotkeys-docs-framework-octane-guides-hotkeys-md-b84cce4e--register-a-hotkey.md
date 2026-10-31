# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Register a hotkey

Call `useHotkey` with a hotkey and a callback:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkey('Mod+S', () => saveDocument())

  <textarea />
}
```

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler tracks hooks by call site, so call them at the top level of the component, not in loops or conditions.

The callback receives the `KeyboardEvent` and a context object:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The hook reads its arguments after each commit, so the callback can use current props and state:

```tsx
import { useState } from 'octane'

function Counter() @{
  const [count, setCount] = useState(0)

  // Logs the current count, not the count from the first render
  useHotkey('Mod+Shift+C', () => console.log(count))

  <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

The hotkey and its options can change between renders too. When only the options change, the hook updates the existing registration. When the hotkey or its `target` changes, the hook replaces the registration:

```tsx
function Editor({ saveHotkey, readOnly }: EditorProps) @{
  useHotkey(saveHotkey, () => save(), { enabled: !readOnly })

  <textarea />
}
```

That lets you register a hotkey the user chose, such as one from the [hotkey recorder](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md#source-hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md). To let users change hotkeys across your app and save their choices, see [App Hotkeys](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md).

### Write a chord as a string or an object

Write most chords as strings. Your editor autocompletes them, and TypeScript rejects a string that isn't a valid chord:

```tsx
useHotkey('Escape', () => close())
useHotkey('Mod+S', () => save()) // Command+S on macOS, Control+S elsewhere
useHotkey('Mod+Alt+Shift+K', () => openCommandLog()) // Modifiers in order: Mod or Control, Alt, Shift, Meta
useHotkey('[KeyW]', () => moveUp()) // The W position, whatever the layout types there

useHotkey('Shift+Mod+S', () => saveAs()) // Type error: Mod comes first
useHotkey('Mod+Meta+S', () => saveAs()) // Type error: Mod is already Meta on macOS
```

Write a chord as a `RawHotkeyChord` object when you build it from data, such as a form with a checkbox for each modifier:

```tsx
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs()) // Same as 'Mod+Shift+S'
useHotkey({ code: 'KeyW' }, () => moveUp()) // Same as '[KeyW]'

useHotkey(
  { key: binding.key, mod: binding.mod, shift: binding.shift },
  () => runAction(),
)
```

Sequence steps can be strings, objects, or a mix:

```tsx
useHotkey(['G', { key: 'H', shift: true }], () => goToHistory())
```

The hook registers every chord and sequence step as a string, so `context.hotkey` shows `'Mod+Shift+S'` for the first object above. [Match a key's position instead](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains codes such as `[KeyW]`.
