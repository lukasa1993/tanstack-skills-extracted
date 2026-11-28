# Lit Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-lit-hotkeys-f7e7a513.md) · Published skill · `@tanstack/lit-hotkeys@0.29.0`.

## Pitfalls

- **`@hotkey` works with standard and legacy decorators.** It needs no tsconfig change. Lit's `@property` and `@state` have their own rules: with standard decorators they need `accessor` fields; with `"experimentalDecorators": true` they need `"useDefineForClassFields": false`. Match the project's existing mode.
- **Decorator options are fixed when the class is defined.** For options that read instance state, or a `target` from a `ref`, use `HotkeyController` with an options function, which reruns after each update of its host.
- **Remove a controller with `dispose()`.** Lit's `removeController` doesn't call `hostDisconnected`, so a `HotkeyController` removed that way stays registered, even after its host disconnects. For a list that changes, keep each item's controller and call `controller.dispose()` when the item goes. Every controller in this package has `dispose()`.
- **Decorating an override replaces the parent's hotkeys.** With `@hotkey` on both a method and a subclass override, only the subclass's hotkeys register for that method. Leave `@hotkey` off the override to keep the parent's.
- **Render a `ref` target in the controller's host.** The options function reruns only when the host updates. If a child element renders the target, keep it in a reactive property or call `requestUpdate()` on the host when it changes.
- **Release every scope you activate.** Lit has no provider, so a dialog activates its scope in `connectedCallback` with `this.release = getHotkeyManager().activateScope('dialog-1', { exclusive: true })` and calls `this.release()` in `disconnectedCallback`. A forgotten release keeps every other hotkey suspended. Give each open dialog its own scope name.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Lit](../assets/tanstack-lit-hotkeys/references/app-hotkeys.md).
