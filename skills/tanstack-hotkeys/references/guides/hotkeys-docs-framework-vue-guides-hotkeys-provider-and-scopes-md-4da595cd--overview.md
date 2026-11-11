# Hotkeys Provider And Scopes — Overview

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

`HotkeysProvider` is optional. Without one, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works whenever its component is mounted. Many apps never need more. Add a provider when you want to:

- Change the default options for every hotkey or recorder in part of your app.
- Provide [app hotkeys](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md) and the user's custom hotkeys.
- Group hotkeys into scopes that turn on and off together, such as everything in a dialog.
