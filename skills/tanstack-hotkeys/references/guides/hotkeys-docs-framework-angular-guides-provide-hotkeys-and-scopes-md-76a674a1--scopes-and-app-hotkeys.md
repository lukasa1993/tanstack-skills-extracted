# Provide Hotkeys And Scopes — Scopes and app hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Scopes and app hotkeys

An [app hotkey](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md) can declare a `scope`. The declared scope wins over the provider it registers under:

```ts
export const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' }, scope: 'document' },
  'comment.post': { hotkey: 'Mod+S', meta: { name: 'Post comment' }, scope: 'comments' },
  'palette.open': { hotkey: 'Mod+K', meta: { name: 'Command palette' }, scope: 'global' },
})
```

- Declarations without a `scope` use the provider's scope, like any other hotkey.
- **Conflict detection.** `findConflicts` and `setCustomHotkey` let app hotkeys in different named scopes share a hotkey, as `doc.save` and `comment.post` do above. An app hotkey in `'global'` or with no declared scope conflicts with every app hotkey that uses the same hotkey, so declare `scope` on bindings meant to coexist.
- [`injectAppHotkeyList`](./hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md-725426f1.md#source-hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md) reports an app hotkey as `'suspended'` when it has enabled registrations but none in an active scope.
