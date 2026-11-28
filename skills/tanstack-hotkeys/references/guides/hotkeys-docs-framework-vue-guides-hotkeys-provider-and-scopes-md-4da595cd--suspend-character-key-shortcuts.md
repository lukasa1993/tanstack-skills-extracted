# Hotkeys Provider And Scopes — Suspend character key shortcuts

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Suspend character key shortcuts

Pass `suspend-character-keys` to `HotkeysProvider` (or `suspendCharacterKeys` to `provideHotkeysContext`) to pause document-level character key shortcuts, such as `K` or `['G', 'H']`, across the app while the value is `true`. Suspended hotkeys report the status `'suspended'`, like hotkeys in an inactive scope, and the option applies even when `enabled` is `false`. Wire it to a user setting as shown in [Accessibility](./hotkeys-docs-framework-vue-guides-accessibility-md-1f6185d7.md#source-hotkeys-docs-framework-vue-guides-accessibility-md).
