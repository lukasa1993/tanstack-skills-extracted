# Hotkeys — Default options

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Default options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```ts
@hotkey('Mod+S', {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined, // smart default: false for Mod+S, true for single keys
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
save() { /* ... */ }
```

If you omit `target`, the Lit adapter resolves it when the controller connects: it listens on `document` in the browser, and skips registration in non-DOM environments.

### Why these defaults?

Most hotkey registrations are meant to override default browser behavior, such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. So `preventDefault` and `stopPropagation` are `true` by default, and you opt out per hotkey when you actually want the browser behavior.

#### Smart input handling: `ignoreInputs`

The `ignoreInputs` default depends on the hotkey. Hotkeys involving `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key fire even when focus is inside input elements (text fields, text areas, etc.) and button-type inputs (`type="button"`, `"submit"`, or `"reset"`). Single key shortcuts, and those using only `Shift`/`Alt`, are ignored within non-button inputs so they don't interfere with normal typing.

#### Hotkey conflicts: `conflictBehavior`

When you register a hotkey that is already registered elsewhere in your app, the library logs a warning by default (`conflictBehavior: 'warn'`). This helps catch accidental duplicate bindings during development.
