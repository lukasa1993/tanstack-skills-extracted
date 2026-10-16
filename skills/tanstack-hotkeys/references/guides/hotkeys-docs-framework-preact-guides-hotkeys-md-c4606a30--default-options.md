# Hotkeys — Default options

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

## Default options

When you register a hotkey without options, or omit specific ones, these defaults apply:

```tsx
useHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  capture: false,
  requireReset: false, // chords only
  timeout: 1000, // sequences only
  ignoreInputs: 'auto', // false for Mod+S and Escape, true for single keys
  target: document,
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
```

### Why these defaults?

Most hotkey registrations exist to override the browser. When you bind `Mod+S` to save a document, you don't want the browser's "Save Page" dialog too. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling with `ignoreInputs`

By default, `Ctrl`/`Meta` shortcuts (like `Mod+S`) and `Escape` fire even while focus is inside a text field or textarea, so save and close work wherever the user happens to be. Single keys and `Shift`/`Alt` combos are ignored inside non-button inputs, because those are just typing. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) allow unrelated shortcuts while preserving their native activation keys.

#### Hotkey conflicts and `conflictBehavior`

If you register a hotkey that's already registered somewhere else in your app, the library logs a warning by default (`conflictBehavior: 'warn'`). That surfaces accidental duplicate bindings during development, before they reach production.

### Chord and sequence options

Most options apply to both kinds. `requireReset` applies only to chords and `timeout` only to sequences. The option types follow the hotkey you pass, so TypeScript rejects `timeout` on a chord and `requireReset` on a sequence:

```tsx
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

When the kind is not known statically, such as a `Hotkey` loaded from settings, only the shared options are accepted.

### Global defaults via provider

You can change the default options for all `useHotkey` and `useHotkeys` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults. Defaults apply only to the kinds that support them, so a default `timeout` affects sequences and a default `requireReset` affects chords.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false, timeout: 1500 },
  }}
>
  <App />
</HotkeysProvider>
```
