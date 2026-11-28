# Vue Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-vue-hotkeys-ef953b39.md) · Published skill · `@tanstack/vue-hotkeys@0.27.0`.

## Pitfalls

- **Pass the ref, not `.value`.** `{ enabled: isDirty.value }` is read once, so the hotkey never turns on, and `{ target: panel.value }` is `null` in setup, so the hotkey never registers. Pass `isDirty` and `panel`. `enabled` and `target` accept refs and getters; for other options that depend on state, pass a getter for the whole options object.
- **A component ref listens on the component's root element.** `useTemplateRef<InstanceType<typeof Panel>>('panel')` works as `target`. The root element is read when the ref is set: a component with more than one root node or a text root registers nothing, and a root the component adds or swaps later (`v-if` on the root) isn't followed. Put the ref on an element instead.
- **Put the provider around the dialog component.** A `HotkeysProvider` in a component's own template, or `provideHotkeysContext` in its own setup, applies only to its children. Register the dialog's hotkeys in a child component, and give each open dialog its own scope name, such as `` `dialog-${useId()}` ``.
- **Destructure the recorder.** Templates unwrap only top-level refs, so `v-if="recorder.isRecording"` is always true. Use `const { isRecording, startRecording } = useHotkeyRecorder(...)`.
- **The callback isn't tracked.** Read refs and props inside it.
- **Call the composables directly.** A `useShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, reactive options, and app hotkeys.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels that differ after hydration for Mac and Windows users. Set the provider's `defaultOptions.platform` to `detectPlatform(userAgent)` from the request's `User-Agent` header. `useFormatForDisplay()` reads it.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Vue](../assets/tanstack-vue-hotkeys/references/app-hotkeys.md).
