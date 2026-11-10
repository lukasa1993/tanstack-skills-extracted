# Hotkeys Provider And Scopes — Scopes and app hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Scopes and app hotkeys

An [app hotkey](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md) can declare a `scope`. The declared scope wins over the provider it registers under:

```ts
export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': { hotkey: 'Mod+S', meta: { name: 'Post comment' }, scope: 'comments' },
  'palette.open': { hotkey: 'Mod+K', meta: { name: 'Command palette' }, scope: 'global' },
})
```

App hotkeys without a declared scope use the provider's scope, like any other hotkey.

The declared scope also drives conflict checks. `findConflicts` and `setCustomHotkey` let app hotkeys in different scopes share a hotkey, as `doc.save` and `comment.post` do above. An app hotkey in `'global'`, or with no declared scope, conflicts with every app hotkey that uses the same hotkey. Declare scopes on app hotkeys that are meant to share keys.

`useAppHotkeyList` reports an app hotkey as `'suspended'` when it has enabled registrations but none of them is in an active scope.
