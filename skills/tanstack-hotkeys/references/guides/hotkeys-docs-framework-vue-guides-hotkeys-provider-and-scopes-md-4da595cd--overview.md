# Hotkeys Provider And Scopes — Overview

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

`HotkeysProvider` is optional. Without one, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works whenever its component is mounted. Many apps never need more. Add a provider to:

- Override default options for hotkeys or recorders in part of your app
- Supply [app hotkeys](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md) and load or save custom user bindings
- Group shortcuts into scopes that turn on and off together, such as modals, panels, or tabs
