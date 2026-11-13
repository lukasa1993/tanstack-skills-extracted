# Hotkeys Provider And Scopes — Scopes outside Vue

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Scopes outside Vue

For UI that Vue doesn't render, such as a dialog from another library, activate a scope on the hotkey manager. See [Activate a scope](./hotkeys-docs-framework-vue-guides-hotkey-manager-md-0dad2837.md#source-hotkeys-docs-framework-vue-guides-hotkey-manager-md).

`HotkeysProvider` and `provideHotkeysContext` need a component, because they use `provide` and `onMounted`. A hotkey registered in an `effectScope` outside a component can't read a provider's defaults, scope, or app hotkeys. Pass `scope` in its options instead. See [Choose a scope for one hotkey](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md#choose-a-scope-for-one-hotkey).
