# Provide Hotkeys And Scopes — Turn a scope off with `enabled`

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Turn a scope off with `enabled`

Pass `enabled` to deactivate a provider's scope while its component stays rendered. This suits tabs, carousels, and split views that keep inactive panes rendered.

`scope`, `exclusive`, and `enabled` accept getters. They run in the providing component's injection context, so they can `inject()` that component and read its inputs:

```ts
@Component({
  selector: 'app-folder',
  providers: [
    provideHotkeys({
      scope: () => inject(Folder).name(),
      enabled: () => inject(Folder).current(),
    }),
  ],
  template: `...`,
})
export class Folder {
  readonly name = input.required<string>()
  readonly current = input(false)

  constructor() {
    // Only the current folder's handler runs
    injectHotkey('Alt+N', () => this.addItem())
  }
}
```

```html
@for (name of folders; track name) {
  <app-folder [name]="name" [current]="current() === name" />
}
```

The folder's hotkeys don't check which folder is current. Without scopes, each would need its own `enabled` option. Getters are tracked like `computed`, so the scope turns on and off as the inputs change.

`enabled` is inherited. Disabling a provider also deactivates every scope nested in it. A provider without its own `scope` has no scope to deactivate, so disabling it affects only the scoped providers inside it.

Hotkeys in an inactive scope stay registered. Devtools list them under their inactive scope, and [`injectAppHotkeyList`](./hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md-725426f1.md#source-hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md) reports their app hotkeys as `'suspended'`.

### Pages kept alive by route reuse

A custom `RouteReuseStrategy` detaches a page instead of destroying it. Ionic's page stack does the same. A detached page keeps its hotkeys and its scope, so its hotkeys still fire, and a detached exclusive scope still suspends the visible page.

Give the page a scope, and turn it off with `enabled` while the page is detached. `<router-outlet>` emits the page component on `(detach)` and `(attach)`:

```ts
@Component({
  selector: 'app-inbox',
  providers: [
    provideHotkeys({ scope: 'inbox', enabled: () => inject(Inbox).attached() }),
  ],
  template: `...`,
})
export class Inbox {
  readonly attached = signal(true)

  constructor() {
    injectHotkey('C', () => this.compose())
  }
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <router-outlet
      (attach)="setAttached($event, true)"
      (detach)="setAttached($event, false)"
    />
  `,
})
export class App {
  setAttached(page: unknown, attached: boolean) {
    if (page instanceof Inbox) page.attached.set(attached)
  }
}
```

With Ionic, set `attached` in the page's `ionViewWillEnter` and `ionViewWillLeave` hooks instead. Hotkeys that name another scope with the `scope` option, such as `'global'`, keep firing.
