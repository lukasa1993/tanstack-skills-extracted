# Provide Hotkeys And Scopes — Overview

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

`provideHotkeys` is optional. Without it, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works for as long as its component exists. Many apps never need more. Add it to your application config or to a component's `providers` when you want to:

- Change the default options for every hotkey or recorder in part of your app.
- Provide [app hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md) and the user's custom hotkeys.
- Group hotkeys into scopes that turn on and off together, such as everything in a dialog.
