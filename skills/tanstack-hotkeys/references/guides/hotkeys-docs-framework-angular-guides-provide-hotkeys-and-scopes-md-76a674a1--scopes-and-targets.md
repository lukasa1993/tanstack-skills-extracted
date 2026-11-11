# Provide Hotkeys And Scopes — Scopes and targets

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Scopes and targets

A scope and a [target](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md) both limit when a hotkey works, and a hotkey can have both:

```ts
@Component({
  selector: 'app-editor',
  providers: [provideHotkeys({ scope: 'editor' })],
  template: `<nav #outline tabindex="0">...</nav>`,
})
export class Editor {
  private readonly outline = viewChild<ElementRef<HTMLElement>>('outline')

  constructor() {
    // In the 'editor' scope: works wherever focus is, while the scope is active
    injectHotkey('Mod+B', () => this.toggleBold())

    // Also has a target: works only while focus is inside the outline
    injectHotkey('Delete', () => this.deleteHeading(), { target: this.outline })
  }
}
```

| | Scope | Target |
| --- | --- | --- |
| Decides | Whether the hotkey is on | Which key presses the hotkey receives |
| Based on | Which providers exist and are enabled | Where focus is |
| Follows | The injector tree, including overlays | The DOM |
| Set with | `provideHotkeys({ scope })`, or the `scope` option | The `target` option |
| Use for | Dialogs, panes, and tabs | Focusable elements, such as a list or a code editor |
