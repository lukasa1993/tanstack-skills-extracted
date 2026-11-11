# Hotkeys Provider And Scopes — Choose a scope for one hotkey

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Choose a scope for one hotkey

Pass `scope` to a single hotkey to register it somewhere other than the nearest provider's scope:

```ts
// Registered in 'global' even when this component renders inside a scope
useHotkey('Mod+K', () => openPalette(), { scope: 'global' })
```

A hotkey can name any scope, but it fires only while some provider has that scope active.
