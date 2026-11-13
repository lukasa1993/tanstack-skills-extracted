# Angular Hotkeys — Overview

[Guide and prerequisites](./tanstack-angular-hotkeys-aae98366.md) · Published skill · `@tanstack/angular-hotkeys@0.24.0`.

# TanStack Hotkeys in Angular

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts
import { Component, ElementRef, signal, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-panel',
  template: `<div #panel tabindex="0" (input)="isDirty.set(true)">Panel</div>`,
})
export class PanelComponent {
  readonly isDirty = signal(false)
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    injectHotkey(
      'Mod+S',
      () => this.save(),
      () => ({ enabled: this.isDirty() }),
    )
    // A viewChild signal target registers once the element renders.
    injectHotkey('Escape', () => this.close(), { target: this.panel })
  }

  save() {}
  close() {}
}
```
