# Preact Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-preact-hotkeys-d76f076a.md) · Published skill · `@tanstack/preact-hotkeys@0.26.0`.

## Pitfalls

- **Pass the ref, not `ref.current`.** `target: listRef.current` is `null` on the first render, and a `null` target registers nothing, so the hotkey doesn't work until the component renders again. Pass `target: listRef` for an element the component always renders.
- **Keep elements that mount later in state.** The hook reads a ref only after its component renders, so it misses an element that mounts later, such as one a child shows from its own state. Use `const [el, setEl] = useState<HTMLElement | null>(null)`, `target: el`, and `ref={setEl}`; the hotkey registers when the element mounts and unregisters when it unmounts.
- **No dependency arrays or `useCallback`.** The hooks read the hotkey, callback, and options on every render, so inline callbacks always see current state.
- **Call the hooks directly.** A `useShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, options, app hotkeys, and the typed callback context.
- **In tests,** set `<HotkeysProvider defaultOptions={{ platform: 'mac' }}>`. It applies to hotkeys, recorders, labels, and app hotkey conflict checks.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels that differ after hydration for Mac and Windows users. Set the provider's `defaultOptions.platform` to `detectPlatform(userAgent)` from the request's `User-Agent` header. `useFormatForDisplay()` reads it.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Preact](../assets/tanstack-preact-hotkeys/references/app-hotkeys.md).
