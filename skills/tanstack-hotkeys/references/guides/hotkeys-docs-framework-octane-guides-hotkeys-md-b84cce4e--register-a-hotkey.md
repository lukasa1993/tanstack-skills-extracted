# Hotkeys — Register a hotkey

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Register a hotkey

Pass a hotkey and callback to `useHotkey`:

```tsx
import { useHotkey } from '@tanstack/octane-hotkeys'

function Editor() @{
  useHotkey('Mod+S', () => saveDocument())

  <textarea />
}
```

Write hook calls in compiler-enabled `.tsrx` components. The Octane compiler tracks hooks by call site, so call them at the top level of the component, not in loops or conditions.

Callbacks receive the `KeyboardEvent` and a context object:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey) // 'Mod+S'
  console.log(context.parsedChord.modifiers) // ['Meta'] on macOS, ['Control'] elsewhere
})
```

The hook reads its arguments after each commit, so callbacks always see fresh props and state without a dependency array:

```tsx
import { useState } from 'octane'

function Counter() @{
  const [count, setCount] = useState(0)

  // Always logs the latest count
  useHotkey('Mod+Shift+C', () => console.log(count))

  <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

Both the hotkey and its options can change between renders. Changing only options updates the existing registration in place. Changing the hotkey or `target` replaces the registration cleanly:

```tsx
function Editor({ saveHotkey, readOnly }: EditorProps) @{
  useHotkey(saveHotkey, () => save(), { enabled: !readOnly })

  <textarea />
}
```

That makes it straightforward to wire up user-chosen shortcuts from the [hotkey recorder](./hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md-b8f4a757.md#source-hotkeys-docs-framework-octane-guides-custom-hotkey-recording-md) or centralized [App Hotkeys](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md).

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

String bindings type-check against US QWERTY keys by default. To bind layout-specific keys such as `Ö` or `§`, register those layouts. See [Keyboard Layouts](./hotkeys-docs-framework-octane-guides-keyboard-layouts-md-68141efd.md#source-hotkeys-docs-framework-octane-guides-keyboard-layouts-md).

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

### Custom hooks

Group hotkeys in a custom hook. The compiler gives each hook call its own slot only in modules it compiles:

- `.tsrx` and `.tsx` files.
- `.ts` and `.js` files that import a value from `octane`, such as `useState`. A type-only import doesn't count.
- `.ts` and `.js` files that start with `/** @jsxImportSource octane */`.

Calls from any other `.ts` or `.js` file get no slot of their own. In one component, all such calls to the same hook share one slot, even when they come from different custom hooks. Only the last call works, and nothing warns. Add the pragma to every file with a custom hook:

```ts
/** @jsxImportSource octane */
import { useHotkey } from '@tanstack/octane-hotkeys'

export function useEditorShortcuts(editor: Editor) {
  useHotkey('Mod+B', () => editor.toggleBold())
  useHotkey('Mod+I', () => editor.toggleItalic())
}
```

Without the pragma, only `Mod+I` would register. The same happens when one component uses two such custom hooks that each call `useHotkey` once. To register a list in one call, use [`useHotkeys`](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#register-multiple-hotkeys).
