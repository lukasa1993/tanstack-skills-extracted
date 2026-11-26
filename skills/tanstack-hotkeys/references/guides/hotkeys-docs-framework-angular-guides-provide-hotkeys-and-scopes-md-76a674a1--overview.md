# Provide Hotkeys And Scopes — Overview

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

`provideHotkeys` is optional. Without it, every hotkey uses the built-in defaults and belongs to the `'global'` scope, so it works for as long as its component exists. Many apps never need more. Add it to:

- Override default options for hotkeys or recorders in part of your app
- Supply [app hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md) and load or save custom user bindings
- Group shortcuts into scopes that turn on and off together, such as modals, panels, or tabs
