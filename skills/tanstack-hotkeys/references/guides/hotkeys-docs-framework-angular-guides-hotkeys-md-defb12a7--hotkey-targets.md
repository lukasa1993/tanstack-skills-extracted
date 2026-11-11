# Hotkeys — Hotkey targets

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Hotkey targets

A hotkey listens on `document` by default, so it works wherever focus is on the page. Set `target` to an element, an `ElementRef`, `document`, or `window` to listen somewhere else. To listen on an element in the template, pass its `viewChild` signal:

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-panel',
  template: `<div #panel tabindex="0">Panel content</div>`,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    // Fires only while the panel, or something inside it, has focus
    injectHotkey('Escape', () => this.closePanel(), { target: this.panel })
  }
}
```

The hotkey reads the signal, so it registers once the element renders and moves if the element changes. A `null` or `undefined` target, or a signal of either, registers nothing until the element exists, including a value read in an options function, such as `() => ({ target: this.panel()?.nativeElement })`. Only an omitted `target` listens on `document`, so a wrapper that forwards an unset `target` waits too. Set `target: document` to choose the document explicitly.

> [!NOTE]
> An element receives key presses only while it, or something inside it, has focus. Give it a `tabindex` if it isn't focusable already.

While focus is inside the element, its hotkeys run before hotkeys on `document`. With the default `stopPropagation: true`, a `document` hotkey for the same key doesn't run at all. A sequence with a target advances only on key presses inside the target.

### A target is not a scope

A target and a [scope](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) both limit when a hotkey works, in different ways:

- A target decides which key presses the hotkey receives, based on where focus is.
- A scope decides whether the hotkey is on, based on which parts of your app are active, such as an open dialog. Focus doesn't matter.

Use a target for hotkeys that belong to a focusable element, such as a list or a code editor. Use a scope for hotkeys that belong to a part of your app, whether or not it has focus. A hotkey can have both.
