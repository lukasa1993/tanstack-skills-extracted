# Provide Hotkeys And Scopes — Exclusive scopes

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

## Exclusive scopes

An exclusive scope suspends every other scope while it is active, including `'global'`. Use it for dialogs, menus, and other overlays that should own the keyboard:

```ts
@Component({
  selector: 'app-edit-dialog',
  providers: [provideHotkeys({ scope: 'edit-dialog', exclusive: true })],
  template: `<div role="dialog">...</div>`,
})
export class EditDialog {
  constructor() {
    injectHotkeys([
      { hotkey: 'Escape', callback: () => this.close() },
      { hotkey: 'Mod+S', callback: () => this.saveAndClose() },
    ])
  }
}
```

While the dialog is open, `Mod+S` saves the dialog and nothing else, even though the page behind it registers `Mod+S` too. Scopes nested inside the exclusive provider keep working, so the dialog can still be built from scoped components.

A scope follows the injector tree, not the DOM. A dialog component that renders in an overlay keeps the scope from its own `providers`.

### Allow other scopes

Pass `{ allow }` to keep some scopes working while an exclusive scope is active:

```ts
provideHotkeys({
  scope: 'edit-dialog',
  exclusive: { allow: ['global', 'command-palette'] },
})
```

- An allowed scope still has to be active on its own. Only `'global'` is always active.
- Allowed scopes follow the usual precedence. A popover that opens over the dialog in an allowed scope is newer, so its `Escape` closes the popover first.
- A getter can return a new `allow` array each time. Providers compare it by value, so an equal array does not reactivate the scope.

### Stacked exclusive scopes

When two exclusive scopes are active at once, such as a confirmation dialog opened from inside an edit dialog, the higher-precedence one wins and only its `allow` list applies. Give each exclusive scope a unique name. Activating the same exclusive scope twice logs a development warning, because hotkeys from both providers would fire together.
