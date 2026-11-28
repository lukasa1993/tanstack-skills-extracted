# Solid Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-solid-hotkeys-a9ad9600.md) · Published skill · `@tanstack/solid-hotkeys@0.28.0`.

## Pitfalls

- **Pass options as an accessor.** `{ enabled: isDirty() }` is read once, during setup, so the hotkey never follows the signal. Use `() => ({ enabled: isDirty() })`. The hotkey and `createHotkeys`' definitions also accept accessors.
- **Keep element targets in a signal.** A `let el` variable is still `undefined` when the options are read, and nothing tracks it, so the hotkey waits and never registers. Use `ref={setEl}` and `() => ({ target: el() })`; a `null` or `undefined` target waits for the element.
- **Give removable elements their own component.** For an element inside `<Show>` or `<For>`, call `createHotkey` with a signal `target` in a component that renders the element, so the hotkey unregisters when Solid removes the component. Don't call `createHotkey` in a `ref` callback: Solid 2 runs it outside the component's owner, and it throws.
- **The callback isn't tracked.** Read props inside it, as `() => props.onClose()`, rather than passing `props.onClose` itself.
- **Register a dialog's hotkeys in a child of its provider.** A primitive uses the nearest `HotkeysProvider` above its component, so a dialog that renders `<HotkeysProvider scope={...} exclusive>` and creates `Escape` itself puts it in the suspended outer scope. Give each open dialog its own scope name, such as `` `dialog-${createUniqueId()}` ``.
- **Call the primitives directly.** A `createShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, accessor options, and app hotkeys.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels, and Solid keeps them after hydration for Mac and Windows users. Set the provider's `defaultOptions.platform` to `detectPlatform(userAgent)` from the request's `User-Agent` header. `createFormatForDisplay()` reads it.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Solid](../assets/tanstack-solid-hotkeys/references/app-hotkeys.md).
