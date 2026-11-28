# Svelte Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-svelte-hotkeys-8bce2478.md) · Published skill · `@tanstack/svelte-hotkeys@0.27.0`.

## Pitfalls

- **Pass options as a getter.** `{ enabled: isDirty }` is read once, during initialization, so the hotkey never follows the state. Use `() => ({ enabled: isDirty })`. The hotkey and `createHotkeys`' definitions also accept getters.
- **Don't destructure the returned objects.** `const { held } = getIsKeyHeld('Shift')` copies the value once. Keep the object and read `shift.held`, `recorder.isRecording`, or `appHotkeys.current` where you use it.
- **Use attachments for element hotkeys.** The `target` option takes only `document` or `window`.
- **Call `setHotkeysContext` before creating the component's hotkeys.** It applies to the component itself, so a hotkey created first lands in the outer scope, which an exclusive context then suspends. It reads its options once; for `enabled` or `exclusive` that change, wrap the component in `<HotkeysProvider>`. Give each open dialog its own scope name.
- **The callback isn't tracked.** Read state and props inside it.
- **Call the functions directly.** A `createShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, getter options, and app hotkeys.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels that differ after hydration for Mac and Windows users. Set the provider's `defaultOptions.platform` to `detectPlatform(userAgent)` from the request's `User-Agent` header. `getFormatForDisplay()` reads it.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Svelte](../assets/tanstack-svelte-hotkeys/references/app-hotkeys.md).
