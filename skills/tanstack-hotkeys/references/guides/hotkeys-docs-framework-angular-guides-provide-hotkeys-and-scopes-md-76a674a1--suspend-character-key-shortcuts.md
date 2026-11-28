# Provide Hotkeys And Scopes — Suspend character key shortcuts

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Suspend character key shortcuts

Pass `suspendCharacterKeys` to `provideHotkeys` to pause document-level character key shortcuts, such as `K` or `['G', 'H']`, across the app while it evaluates to `true`. Suspended hotkeys report the status `'suspended'`, like hotkeys in an inactive scope, and the option applies even when `enabled` is `false`. Wire it to a user setting as shown in [Accessibility](./hotkeys-docs-framework-angular-guides-accessibility-md-acf0aad2.md#source-hotkeys-docs-framework-angular-guides-accessibility-md).
