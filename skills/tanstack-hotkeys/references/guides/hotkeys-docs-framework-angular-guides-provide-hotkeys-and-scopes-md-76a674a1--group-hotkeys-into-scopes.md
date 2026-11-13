# Provide Hotkeys And Scopes — Group hotkeys into scopes

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Group hotkeys into scopes

Apps reuse keys. `Escape` should close the dialog, not the panel behind it, and `Mod+S` should post the comment you are typing, not save the whole document. You could pass [`enabled`](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md) to every hotkey, but then each component has to know about every other component that might want the same key.

Scopes group hotkeys by where they render instead. Add `provideHotkeys` with a `scope` to a component's `providers`, and every hotkey injected in that component and its children belongs to that scope. The scope is active while the component exists and the provider is enabled, and nested scopes take precedence over the scopes around them.

```ts
import { Component } from '@angular/core'
import { injectHotkey, provideHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  providers: [provideHotkeys({ scope: 'editor' })],
  template: `...`,
})
export class Editor {
  constructor() {
    // Registered in the 'editor' scope
    injectHotkey('Mod+B', () => this.toggleBold())
  }
}
```

A hotkey registered with `injectHotkey` or `injectHotkeys` uses the scope of the nearest provider that sets one. Hotkeys outside any scoped provider, including those under the `provideHotkeys` in your application config, are in the `'global'` scope, which is always active. A provider without `scope` uses its parent's scope.

The scope activates when something under the provider first reads it, such as `injectHotkey` or `injectFormatForDisplay`, and stays active until the component is destroyed. Angular creates a provider only when something injects it, so a provider with no hotkeys or labels under it never activates. To activate it anyway, such as for an exclusive overlay that has no hotkeys of its own, call `injectHotkeysContext()` in the component:

```ts
import { Component } from '@angular/core'
import { injectHotkeysContext, provideHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-loading-overlay',
  providers: [provideHotkeys({ scope: 'loading', exclusive: true })],
  template: `...`,
})
export class LoadingOverlay {
  constructor() {
    // Activates the scope now, so the page's hotkeys stop while it shows
    injectHotkeysContext()
  }
}
```

Scopes are names, not instances. Two components that provide the `editor` scope share one scope, and it stays active until both are destroyed. Give each region its own name when you need to turn them on and off separately.

### Scopes for a route's page

Put a page's scope in its component's `providers`, not in the route's `providers`. The router creates an injector for `Route.providers` and keeps it after the user navigates away, so a scope provided there stays active on the next page. An exclusive one keeps every other hotkey suspended.

```ts
// Don't: the 'edit' scope outlives the page
const routes: Routes = [
  {
    path: 'edit',
    component: EditPage,
    providers: [provideHotkeys({ scope: 'edit', exclusive: true })],
  },
]

// Do: the scope ends when the page component is destroyed
@Component({
  selector: 'app-edit-page',
  providers: [provideHotkeys({ scope: 'edit', exclusive: true })],
  template: `...`,
})
export class EditPage {
  constructor() {
    injectHotkey('Escape', () => this.cancel())
  }
}
```

If the scope must stay in `Route.providers`, and your app uses Angular 22.2 or later, add [`withAutoCleanupInjectors()`](https://angular.dev/api/router/withAutoCleanupInjectors) to `provideRouter`. The router then destroys a route's injector when its page leaves, and the scope ends with it. This works with the default route reuse strategy. A custom `RouteReuseStrategy` must return `true` from `shouldDestroyInjector`, and must report the pages it stores through `retrieveStoredRouteHandles()`, or the router can destroy a stored page's injector. A stored page keeps its injector, so its scope stays active; turn it off while the page is detached, as in [Pages kept alive by route reuse](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#pages-kept-alive-by-route-reuse).
