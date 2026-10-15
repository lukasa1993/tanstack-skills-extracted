# Hotkeys — Updating options

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.12.0`.

## Updating options

Pass current options when the component renders. Hooks synchronize those options with the existing registration. You do not need to call `setOptions` in application code. Provider defaults and recorder options follow the same component update lifecycle.

Property getters are read when the hook runs. They do not subscribe to external state independently of the component. Keep changing values in framework state so the component updates, and avoid creating an options object once with an initial state snapshot.
