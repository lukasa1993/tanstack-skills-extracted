# Angular Hotkeys — A dialog that owns the keyboard

[Guide and prerequisites](./tanstack-angular-hotkeys-aae98366.md) · Published skill · `@tanstack/angular-hotkeys@0.24.0`.

## A dialog that owns the keyboard

```ts
import { Component, InjectionToken, inject, output } from '@angular/core'
import { injectHotkey, provideHotkeys } from '@tanstack/angular-hotkeys'

let nextDialogId = 0
const DIALOG_SCOPE = new InjectionToken<string>('DIALOG_SCOPE')

@Component({
  selector: 'app-dialog',
  providers: [
    { provide: DIALOG_SCOPE, useFactory: () => `dialog-${++nextDialogId}` },
    provideHotkeys({ scope: () => inject(DIALOG_SCOPE), exclusive: true }),
  ],
  template: `<div role="dialog"><ng-content /></div>`,
})
export class DialogComponent {
  readonly closed = output()

  constructor() {
    injectHotkey('Escape', () => this.closed.emit())
  }
}
```

A component's `providers` apply to the component itself, so it can register its own scoped hotkeys. A fixed `scope: 'dialog'` would give every open dialog the same scope; the per-instance token gives each its own.
