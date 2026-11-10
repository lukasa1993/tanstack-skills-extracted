# Provide Hotkeys And Scopes — Choose a scope for one hotkey

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Choose a scope for one hotkey

Pass `scope` to a single hotkey to register it somewhere other than the nearest provider's scope:

```ts
// Registered in 'global' even when this component is inside a scope
injectHotkey('Mod+K', () => this.openPalette(), { scope: 'global' })
```

A hotkey can name any scope, but it fires only while some provider has that scope active.
