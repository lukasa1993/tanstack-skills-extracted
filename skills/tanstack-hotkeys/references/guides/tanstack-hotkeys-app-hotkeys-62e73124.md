# App Hotkeys

<a id="source-tanstack-hotkeys-app-hotkeys"></a>

Published skill · `@tanstack/hotkeys@0.20.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Hotkeys Core](./tanstack-hotkeys-core-62518e1a.md).

# App hotkeys

This skill builds on `hotkeys-core`. The adapter skill's app hotkeys reference shows the wiring in your framework.

App hotkeys are the library's shortcut catalog. Use them instead of a separate shortcut config, context, or hand-written cheat sheet. One module declares every shortcut. The root provider holds the user's custom hotkeys. Components register the declared app hotkeys with their callbacks. Plain hotkeys with `meta` are enough when a list only needs what is mounted right now.

```ts
import { defineAppHotkeys } from '@tanstack/hotkeys'

export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': {
    hotkey: 'Mod+S',
    meta: { name: 'Post comment' },
    scope: 'comments',
  },
  'theme.toggle': { hotkey: null, meta: { name: 'Toggle theme' } },
})
```

Augment `Register` in the adapter module you import from, such as `declare module '@tanstack/react-hotkeys' { interface Register { appHotkeys: typeof appHotkeys } }`, to type ids. Lit, Alpine, and Ember have no provider: call `provideAppHotkeys(appHotkeys, options)` once at startup.

## Pitfalls

- **Register the app hotkey, not its value.** Pass `appHotkeys['doc.save']`. Passing `.hotkey` registers the declared default, so the user's rebinding never applies, and the list reports the shortcut as `'inactive'`.
- **The provider reads `customHotkeys` once.** When saved shortcuts load asynchronously, render the provider after they arrive, or key it by user. Change shortcuts afterwards through the adapter's custom hotkeys API, not by updating the prop.
- **Save what `onCustomHotkeysChange` receives.** It holds only the shortcuts the user changed, so users still get new defaults. Saving every effective hotkey freezes today's defaults into their data.
- **Ids are a storage contract.** Saved data is keyed by id, and unknown ids are dropped with a warning, so renaming an id discards users' customizations.
- **`setCustomHotkey` returns conflicts and changes nothing when there are any.** Check the result before reporting success, or reject the key press earlier by calling `findConflicts` in the recorder's `validate`.
- **Declare scopes on app hotkeys that share keys.** An app hotkey without a scope, or in `'global'`, conflicts with every other app hotkey on the same keys, so rebinding is rejected.
- **Conflict checks treat physical and logical bindings as different.** A recorded `Mod+[KeyP]` doesn't conflict with a declared `Mod+P`, although Command+P runs both. Declaring rebindable defaults in the recorder's form, such as `Mod+[KeyP]`, makes them comparable.
- **A cheat sheet dialog usually gets an exclusive scope.** Register the hotkey that opened it inside the dialog too, so the same keys close it.

When building the "press a new shortcut" control, read [recording](../assets/tanstack-hotkeys-app-hotkeys/references/recording.md).
