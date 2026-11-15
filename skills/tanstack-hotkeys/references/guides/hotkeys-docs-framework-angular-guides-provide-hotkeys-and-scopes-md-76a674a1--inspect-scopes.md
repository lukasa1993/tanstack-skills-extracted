# Provide Hotkeys And Scopes — Inspect scopes

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.30.0`.

## Inspect scopes

The hotkeys [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) group registrations by scope and show which scopes are active, suspended, allowed, or exclusive.

Your app doesn't need to track scopes itself. If you want to show scope state anyway, read it from the hotkey manager. See [Read scope state](./hotkeys-docs-framework-angular-guides-hotkey-manager-md-190fe5ab.md#source-hotkeys-docs-framework-angular-guides-hotkey-manager-md).

See the [Scopes example](https://github.com/TanStack/hotkeys/tree/a82e0a38a1d38844690882ca45cab83b3cd0a01e/examples/angular/scopes) for nested, enabled, and exclusive scopes together.
