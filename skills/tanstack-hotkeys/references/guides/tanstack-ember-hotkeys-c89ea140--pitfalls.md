# Ember Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-ember-hotkeys-c89ea140.md) · Published skill · `@tanstack/ember-hotkeys@0.16.0`.

## Pitfalls

- **Use arrow-function fields, or `@action`, for callbacks.** The helpers call a callback without the component as `this`, so a plain method throws when the key is pressed.
- **Build template sequences with `array`.** `{{useHotkey "G G" ...}}` registers a single key named `G G`, which never matches.
- **`createHotkeysScope` isn't a hotkey scope.** It only sets defaults for its helpers. For a dialog, call `getHotkeyManager().activateScope(name, { exclusive: true })` in the constructor, pass the result to `registerDestructor(this, release)`, and put `scope=name` on the dialog's hotkeys. Give each open dialog its own name.
- **Read app hotkeys through getters.** Template paths can't index ids that contain dots.
- **Scopes have no `useHotkeyRecorder`** since v0.9.0. Call `useHotkeyRecorder(this, options, this.hotkeys)`, so apps that set defaults but don't record don't ship the recorder.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels that differ after hydration for Mac and Windows users. Pass `platform: detectPlatform(userAgent)` to `createHotkeysScope`, with the user agent from FastBoot's request, and pass the scope to the utility: `formatForDisplay = useFormatForDisplay(this.hotkeys)`.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Ember](../assets/tanstack-ember-hotkeys/references/app-hotkeys.md).
