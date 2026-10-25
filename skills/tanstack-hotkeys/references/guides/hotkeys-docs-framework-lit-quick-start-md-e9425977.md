# Quick Start

<a id="source-hotkeys-docs-framework-lit-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.18.0`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

This guide adds keyboard shortcuts to Lit elements. If you haven't installed TanStack Hotkeys yet, see [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md).

## Register a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, decorate the method that handles it with `@hotkey`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {
    saveDocument()
  }

  render() {
    return html`<textarea></textarea>`
  }
}
```

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults.

That's all a hotkey needs. Controllers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Register several hotkeys

Decorate one method for each hotkey:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() {
    saveDocument()
  }

  @hotkey('Mod+Z')
  undo() {
    undoAction()
  }

  @hotkey('Mod+Shift+Z')
  redo() {
    redoAction()
  }
}
```

For a hotkey that isn't a method, or one that changes at runtime, use `HotkeyController`, shown [below](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#hotkeys-follow-your-elements).

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```ts
@hotkey(['G', 'G'])
scrollToTop() {
  window.scrollTo({ top: 0 })
}
```

Each step must follow the previous one within a second. Chords and sequences can sit side by side on the same element:

```ts
@customElement('my-app')
class MyApp extends LitElement {
  @hotkey('Mod+K')
  openSearch() {}

  @hotkey(['G', 'H'])
  goHome() {}

  @hotkey(['G', 'S'])
  goToSettings() {}
}
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { formatForDisplay, hotkey } from '@tanstack/lit-hotkeys'
import type { HotkeyChord } from '@tanstack/lit-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

@customElement('save-button')
class SaveButton extends LitElement {
  @hotkey(saveHotkey)
  save() {
    saveDocument()
  }

  render() {
    return html`
      <button @click=${this.save}>
        Save <kbd>${formatForDisplay(saveHotkey)}</kbd>
      </button>
    `
  }
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your elements

A hotkey is registered when its element connects to the document, and unregistered when the element disconnects. Put each hotkey on the element it belongs to, so it is active only while that element is connected:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('settings-dialog')
class SettingsDialog extends LitElement {
  // Registered only while the dialog is connected
  @hotkey('Escape')
  close() {
    this.dispatchEvent(new CustomEvent('close'))
  }

  render() {
    return html`<div role="dialog">...</div>`
  }
}

@customElement('my-app')
class MyApp extends LitElement {
  @state() private isOpen = false

  render() {
    return html`
      <button @click=${() => (this.isOpen = true)}>Settings</button>
      ${this.isOpen
        ? html`<settings-dialog
            @close=${() => (this.isOpen = false)}
          ></settings-dialog>`
        : nothing}
    `
  }
}
```

For a condition that doesn't match an element, pass `enabled`. Decorator options are fixed when the class is defined, so use `HotkeyController` with an options function for values that change:

```ts
import { LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  @state() private hasUnsavedChanges = false

  constructor() {
    super()
    this.addController(
      new HotkeyController(this, 'Mod+S', () => this.save(), () => ({
        enabled: this.hasUnsavedChanges,
      })),
    )
  }
}
```

The controller reads the function again after each update, so keep the values it reads in reactive properties.

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add scopes](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#add-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, pass that element as `target`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-panel')
class MyPanel extends LitElement {
  private panel = createRef<HTMLDivElement>()

  constructor() {
    super()
    // Fires only while the panel, or something inside it, has focus
    this.addController(
      new HotkeyController(this, 'Escape', () => this.closePanel(), () => ({
        target: this.panel.value ?? null,
      })),
    )
  }

  render() {
    return html`<div ${ref(this.panel)} tabindex="0">...</div>`
  }
}
```

A `null` target waits until the element renders. The element must be focusable to receive key presses, so give it a `tabindex` if it isn't a control.

## Add scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its element is connected. Lit has no provider for shared defaults, so set options on each hotkey.

Hotkeys can also be grouped into scopes. Every hotkey in a scope turns on and off with it. Make a scope `exclusive`, and while it is active, only its hotkeys work. Use one for dialogs and popups that should own the keyboard.

Lit has no provider to turn scopes on and off. Activate the scope from the hotkey manager while the element is connected, and pass `scope` to its hotkeys:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { getHotkeyManager, hotkey } from '@tanstack/lit-hotkeys'

@customElement('confirm-dialog')
class ConfirmDialog extends LitElement {
  private releaseScope?: () => void

  connectedCallback() {
    super.connectedCallback()
    this.releaseScope = getHotkeyManager().activateScope('confirm-dialog', {
      exclusive: true,
    })
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.releaseScope?.()
  }

  @hotkey('Enter', { scope: 'confirm-dialog' })
  confirm() {
    this.dispatchEvent(new CustomEvent('confirm'))
  }

  @hotkey('Escape', { scope: 'confirm-dialog' })
  cancel() {
    this.dispatchEvent(new CustomEvent('cancel'))
  }

  render() {
    return html`<div role="dialog">...</div>`
  }
}
```

While the dialog is connected, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog disconnects, they work again.

`activateScope` returns a function that releases the scope. A scope stays active until every activation of it is released.

## Next steps

Learn more about the basics:

- [Hotkeys](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#source-hotkeys-docs-framework-lit-guides-hotkeys-md): chords and sequences, options, and element hotkeys
- [Sequences](./hotkeys-docs-framework-lit-guides-sequences-md-8de222df.md#source-hotkeys-docs-framework-lit-guides-sequences-md): Vim-style multi-key shortcuts
- [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md#source-hotkeys-docs-framework-lit-guides-formatting-display-md): labels and keycaps for every platform
- [Held Key State Helpers](./hotkeys-docs-framework-lit-guides-held-key-state-helpers-md-613e44c6.md#source-hotkeys-docs-framework-lit-guides-held-key-state-helpers-md): show which keys are held
- [Hotkey Hints](./hotkeys-docs-framework-lit-guides-hotkey-hints-md-581ca99a.md#source-hotkeys-docs-framework-lit-guides-hotkey-hints-md): show a button's shortcut while the user holds its modifiers

As your app grows:

- [App Hotkeys](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md-a557e5c4.md#source-hotkeys-docs-framework-lit-guides-cheat-sheet-ui-helpers-md): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md-7d47b3ce.md#source-hotkeys-docs-framework-lit-guides-custom-hotkey-recording-md): record the shortcut a user presses
- [Hotkey Manager](./hotkeys-docs-framework-lit-guides-hotkey-manager-md-506c8dcc.md#source-hotkeys-docs-framework-lit-guides-hotkey-manager-md): register and inspect hotkeys outside components
