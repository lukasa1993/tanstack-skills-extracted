# Alpine Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-alpine-hotkeys-b9b64077.md) · Published skill · `@tanstack/alpine-hotkeys@0.17.0`.

## Pitfalls

- **Destroy each owner.** Owners aren't tied to Alpine's lifecycle, so without `this.hotkeys.destroy()` in `destroy()`, a removed component's hotkeys keep firing. Create one owner per component instance, inside the `Alpine.data` factory.
- **`createHotkeysScope` isn't a hotkey scope.** It only owns registrations and sets defaults. For a dialog, activate a real scope in `init()` with `release = getHotkeyManager().activateScope(name, { exclusive: true })`, pass `{ scope: name }` to the dialog's hotkeys, and call `release()` in `destroy()`. Give each open dialog its own name.
- **Pass options as a getter.** `{ enabled: this.dirty }` is read once. Use `() => ({ enabled: this.dirty })`.
- **Use either `$hotkeys` or your own owner for a hotkey, not both.** Otherwise it registers twice.
- **Use `x-hotkey` on pages that Livewire or `Alpine.morph` updates.** A morph that changes `x-init` runs it again, but `$hotkeys` keeps the old registration until its element is removed, so both hotkeys fire.
- **Alpine's CSP build can't parse arrow functions in markup.** Put the callback in an `Alpine.data` method and name it: `x-hotkey.mod.s="save"`. A call such as `save()` needs `@alpinejs/csp` 3.15 or newer, or use the `init()` pattern.
- **Call `create*` in `x-init` or `init()`, and read `.value` anywhere.** Calling `create*` inside a reactive expression such as `x-text="$hotkeys.createHeldKeys().value"` creates a new subscription on every evaluation.
- **Owners have no `createHotkeyRecorder` method** since v0.10.0. Call `createHotkeyRecorder(this.hotkeys, options)`, so apps that don't record don't ship the recorder.
- With server rendering, load the adapter only in the browser.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Alpine](../assets/tanstack-alpine-hotkeys/references/app-hotkeys.md).
