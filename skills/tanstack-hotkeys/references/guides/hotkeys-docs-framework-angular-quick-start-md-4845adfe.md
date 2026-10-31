# Quick Start

<a id="source-hotkeys-docs-framework-angular-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

[Topic index](../framework-angular.md) · [Source provenance](../SOURCES.md)

This guide adds keyboard shortcuts to an Angular app. If you haven't installed TanStack Hotkeys yet, see [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md).

## Inject a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, call `injectHotkey` in the component that owns the action:

```ts
import { Component } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkey('Mod+S', () => this.save())
  }

  save() {
    // ...
  }
}
```

Call it in an injection context, such as a constructor or a field initializer.

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Inject several hotkeys

When a component has more than one hotkey, register them together with `injectHotkeys`:

```ts
import { Component } from '@angular/core'
import { injectHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-editor',
  template: `<textarea></textarea>`,
})
export class EditorComponent {
  constructor() {
    injectHotkeys([
      { hotkey: 'Mod+S', callback: () => this.save() },
      { hotkey: 'Mod+Z', callback: () => this.undo() },
      { hotkey: 'Mod+Shift+Z', callback: () => this.redo() },
    ])
  }
}
```

`injectHotkeys` also accepts a function that returns the array, so the list can come from signals and change length over time.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
injectHotkey(['G', 'G'], () => this.scrollToTop())
```

Each step must follow the previous one within a second.

`injectHotkeys` accepts chords and sequences in the same array:

```ts
injectHotkeys([
  { hotkey: 'Mod+K', callback: () => this.openSearch() },
  { hotkey: ['G', 'H'], callback: () => this.goHome() },
  { hotkey: ['G', 'S'], callback: () => this.goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```ts
import { Component } from '@angular/core'
import { formatForDisplay, injectHotkey } from '@tanstack/angular-hotkeys'
import type { HotkeyChord } from '@tanstack/angular-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

@Component({
  selector: 'app-save-button',
  template: `<button (click)="save()">Save <kbd>{{ saveLabel }}</kbd></button>`,
})
export class SaveButtonComponent {
  readonly saveLabel = formatForDisplay(saveHotkey)

  constructor() {
    injectHotkey(saveHotkey, () => this.save())
  }

  save() {
    // ...
  }
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when the component that injects it is created, and unregistered when that component is destroyed. Put each hotkey in the component it belongs to, so it is active only while that component exists:

```ts
import { Component, output, signal } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-settings-dialog',
  template: `<div role="dialog">...</div>`,
})
export class SettingsDialogComponent {
  readonly closed = output()

  constructor() {
    // Registered only while the dialog exists
    injectHotkey('Escape', () => this.closed.emit())
  }
}

@Component({
  selector: 'app-root',
  imports: [SettingsDialogComponent],
  template: `
    <button (click)="isOpen.set(true)">Settings</button>
    @if (isOpen()) {
      <app-settings-dialog (closed)="isOpen.set(false)" />
    }
  `,
})
export class AppComponent {
  readonly isOpen = signal(false)
}
```

For a condition that doesn't match a component, pass `enabled`. Pass options as a function, so they follow your signals:

```ts
injectHotkey('Mod+S', () => this.save(), () => ({
  enabled: this.hasUnsavedChanges(),
}))
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#add-providers-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, read the element with `viewChild` and pass it as `target`:

```ts
import { Component, ElementRef, viewChild } from '@angular/core'
import { injectHotkey } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-panel',
  template: `<div #panel tabindex="0">...</div>`,
})
export class PanelComponent {
  private readonly panel = viewChild<ElementRef<HTMLDivElement>>('panel')

  constructor() {
    // Fires only while the panel, or something inside it, has focus
    injectHotkey('Escape', () => this.closePanel(), () => ({
      target: this.panel()?.nativeElement ?? null,
    }))
  }
}
```

A `null` target waits until the element is rendered. The element must be focusable to receive key presses, so give it a `tabindex` if it isn't a control.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component exists. You don't need a provider for that.

Add `provideHotkeys` to your application config to set default options for every hotkey, such as more time between sequence steps:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [provideHotkeys({ defaultOptions: { hotkey: { timeout: 1500 } } })],
}
```

Add `provideHotkeys` to a component's `providers` to group hotkeys into scopes. Every hotkey injected in that component and its children belongs to the scope. Make the scope `exclusive`, and while the component exists, only its hotkeys work. Use one for dialogs and popups that should own the keyboard:

```ts
import { Component, output } from '@angular/core'
import { injectHotkeys, provideHotkeys } from '@tanstack/angular-hotkeys'

@Component({
  selector: 'app-confirm-dialog',
  providers: [provideHotkeys({ scope: 'confirm-dialog', exclusive: true })],
  template: `<div role="dialog">...</div>`,
})
export class ConfirmDialogComponent {
  readonly confirmed = output()
  readonly cancelled = output()

  constructor() {
    injectHotkeys([
      { hotkey: 'Enter', callback: () => this.confirmed.emit() },
      { hotkey: 'Escape', callback: () => this.cancelled.emit() },
    ])
  }
}
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

A component's `providers` apply to the component itself, so the dialog can inject its own hotkeys. [provideHotkeys and Scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) covers nested scopes, precedence, and turning a scope off without destroying it.

## Next steps

Learn more about the basics:

- [Hotkeys](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md): chords and sequences, options, and element hotkeys
- [Sequences](./hotkeys-docs-framework-angular-guides-sequences-md-58c19666.md#source-hotkeys-docs-framework-angular-guides-sequences-md): Vim-style multi-key shortcuts
- [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md#source-hotkeys-docs-framework-angular-guides-formatting-display-md): labels and keycaps for every platform
- [Held Key State Helpers](./hotkeys-docs-framework-angular-guides-held-key-state-helpers-md-6b5f521d.md#source-hotkeys-docs-framework-angular-guides-held-key-state-helpers-md): show which keys are held
- [Hotkey Hints](./hotkeys-docs-framework-angular-guides-hotkey-hints-md-7e437993.md#source-hotkeys-docs-framework-angular-guides-hotkey-hints-md): show a button's shortcut while the user holds its modifiers
- [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md): inspect registered hotkeys, scopes, and held keys while you develop

As your app grows:

- [provideHotkeys and Scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [App Hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md-725426f1.md#source-hotkeys-docs-framework-angular-guides-cheat-sheet-ui-helpers-md): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#source-hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md): record the shortcut a user presses
- [Hotkey Manager](./hotkeys-docs-framework-angular-guides-hotkey-manager-md-190fe5ab.md#source-hotkeys-docs-framework-angular-guides-hotkey-manager-md): register and inspect hotkeys outside components
