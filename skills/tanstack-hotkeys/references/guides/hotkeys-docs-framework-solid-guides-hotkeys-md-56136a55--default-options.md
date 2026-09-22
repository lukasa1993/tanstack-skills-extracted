# Hotkeys — Default options

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Default options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```tsx
createHotkey('Mod+S', callback, {
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

Most hotkey registrations are meant to override default browser behavior, such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling: `ignoreInputs`

By default, hotkeys with `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key fire even when focus is inside input elements (such as text fields or text areas), and when focused on button-type inputs (`type="button"`, `"submit"`, or `"reset"`). Shortcuts like save or close keep working wherever the user is focused. Single-key shortcuts, or those using only `Shift`/`Alt`, are ignored within non-button inputs so they don't interfere with normal typing.

#### Hotkey conflicts: `conflictBehavior`

When you attempt to register a hotkey that is already registered (possibly in another part of your app), the library logs a warning by default using the `conflictBehavior: 'warn'` setting. That helps you catch accidental duplicate bindings during development, before they reach production.

### Global defaults via provider

You can change the default options for all `createHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-primitive options override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false },
  }}
>
  <App />
</HotkeysProvider>
```
