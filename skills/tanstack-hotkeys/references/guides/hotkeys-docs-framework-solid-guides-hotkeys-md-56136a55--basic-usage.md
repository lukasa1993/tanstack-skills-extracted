# Hotkeys — Basic usage

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Basic usage

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  createHotkey('Mod+S', () => {
    saveDocument()
  }, {
    // override the default options here
  })
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```tsx
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)       // 'Mod+S'
  console.log(context.parsedHotkey) // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
})
```

You can pass a hotkey as a string or as a `RawHotkey` object (modifier booleans optional). Use `mod` for cross-platform shortcuts (Command on Mac, Control elsewhere):

```tsx
createHotkey('Mod+S', () => save())
createHotkey({ key: 'S', mod: true }, () => save())           // Same as above
createHotkey({ key: 'Escape' }, () => closeModal())
createHotkey({ code: 'NumpadAdd', mod: true }, () => zoomIn())
createHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```
