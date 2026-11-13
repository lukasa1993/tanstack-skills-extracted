# Angular Hotkeys — Pitfalls

[Guide and prerequisites](./tanstack-angular-hotkeys-aae98366.md) · Published skill · `@tanstack/angular-hotkeys@0.24.0`.

## Pitfalls

- **Pass options as a function.** `{ enabled: this.isDirty() }` is read once, in the constructor. Use `() => ({ ... })`.
- **Pass the `viewChild` signal as `target`, not its value.** `{ target: this.panel() }` reads the signal once in the constructor, where it is `undefined`, so the hotkey waits and never registers. `{ target: this.panel }` waits for the element and follows it. Reading the value inside an options function, such as `() => ({ target: this.panel()?.nativeElement })`, also works.
- **An exclusive provider with no hotkeys or labels never activates.** Angular creates providers lazily, when something under them injects a hotkey or `injectFormatForDisplay()`. With neither, call `injectHotkeysContext()` in the component's constructor to activate the scope.
- **Put scoped providers in a component's `providers`, not `Route.providers`.** The router keeps a route's injector after navigation, so its scope stays active on the next page, and an exclusive one suspends every other hotkey. Provide the scope on the page component. On Angular 22.2 or later, `withAutoCleanupInjectors()` in `provideRouter` also works, as long as the route reuse strategy's `shouldDestroyInjector` returns `true` (the default strategy does) and it reports stored pages through `retrieveStoredRouteHandles()`. A stored page keeps its injector and its scope, so disable that scope with `enabled` on the outlet's `(detach)` and restore it on `(attach)`.
- **Replace `@HostListener('document:keydown')` and `(keydown.control.s)` bindings with `injectHotkey`.**
- **Hotkeys in a service outside any component can't update a view through plain fields.** Callbacks registered in a component or directive mark that component for check, so field changes render in OnPush and zoneless apps. A root or route-level service has no component to mark; store the state its hotkeys change in signals.
- **Register runtime lists in the constructor.** `injectHotkey` throws outside an injection context, such as in `ngOnInit`. For hotkeys from data, use `injectHotkeys(() => this.items().map(...))`.
- **Call the inject functions directly.** A shortcut service or `injectShortcut(keys: string)` wrapper has to cast strings to hotkeys, which turns off type checking and drops sequences, signal options, and app hotkeys.
- **Server-rendered labels need the user's platform.** The server can't see the user's OS, so without a platform it renders Linux labels that differ after hydration for Mac and Windows users. Pass `provideHotkeys({ defaultOptions: () => ({ platform: detectPlatform(inject(REQUEST)?.headers.get('user-agent')) }) })`. `injectFormatForDisplay()` reads it.

When declaring app hotkeys, building a cheat sheet, or letting users rebind shortcuts, load `@tanstack/hotkeys#app-hotkeys` and read [app hotkeys in Angular](../assets/tanstack-angular-hotkeys/references/app-hotkeys.md).
