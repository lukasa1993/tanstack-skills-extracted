# Hotkeys — Default options

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Default options

When you register a hotkey without options, or omit specific ones, these defaults apply:

```tsx
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined, // smart default: false for Mod+S, true for single keys
  target: document,
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
```

### Why these defaults?

Most hotkey registrations exist to override the browser. When you bind `Mod+S` to save a document, you don't want the browser's "Save Page" dialog too. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling with `ignoreInputs`

By default, `Ctrl`/`Meta` shortcuts (like `Mod+S`) and `Escape` fire even while focus is inside a text field or textarea, so save and close work wherever the user happens to be. Single keys and `Shift`/`Alt` combos are ignored inside non-button inputs, because those are just typing. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) don't block any hotkeys.

#### Hotkey conflicts and `conflictBehavior`

If you register a hotkey that's already registered somewhere else in your app, the library logs a warning by default (`conflictBehavior: 'warn'`). That surfaces accidental duplicate bindings during development, before they reach production.

### Global defaults via provider

You can change the default options for all `useHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false },
  }}
>
  <App />
</HotkeysProvider>
```
