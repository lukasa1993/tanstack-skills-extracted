# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md) · Release-matched documentation · `@tanstack/hotkeys@0.15.1`.

## Hotkey options

### `enabled`

Controls whether the hotkey is active. Defaults to `true`.

```ts
@hotkey('Mod+S', { enabled: true })
save() { saveDocument() }
```

### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```ts
// Browser default is prevented (default behavior)
@hotkey('Mod+S')
save() { saveDocument() }

// Opt out when you want the browser's default behavior
@hotkey('Mod+P', { preventDefault: false })
print() { customPrint() }
```

### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```ts
// Event propagation is stopped (default behavior)
@hotkey('Escape')
close() { closeModal() }

// Opt out when you need the event to bubble
@hotkey('Escape', { stopPropagation: false })
close() { closeModal() }
```

### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```ts
// Fire when the key is released
@hotkey('Shift', { eventType: 'keyup' })
deactivateMode() { this.shiftMode = false }
```

### `requireReset`

When `true`, the hotkey fires only once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```ts
// Only fires once per Escape press, not on key repeat
@hotkey('Escape', { requireReset: true })
closePanel() { this.panelOpen = false }
```

### `ignoreInputs`

When `ignoreInputs` is enabled, hotkeys also skip keys that a focused control inside their `target` uses itself: `Enter` and `Space` on buttons and `<summary>`, `Enter` on links, and navigation keys in ARIA widgets such as menus, listboxes, tabs, and grids. A hotkey targeted at the control itself still receives them, and `ignoreInputs: false` handles every key. See [Focused controls keep their own keys](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the full list.

When `true`, the hotkey doesn't fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) allow unrelated shortcuts. The default, `'auto'`, chooses from the hotkey: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

```ts
// Single key - ignored in inputs by default ('auto')
@hotkey('K')
openSearch() { /* ... */ }

// Mod+S and Escape - fire in inputs by default ('auto')
@hotkey('Mod+S')
save() { /* ... */ }

// Override: force a single key to fire in inputs
@hotkey('Enter', { ignoreInputs: false })
submit() { /* ... */ }
```

### `target`

The DOM element to attach the event listener to. When omitted, the Lit adapter resolves `document` at connect time in the browser. Can be a DOM element, `document`, or `window`. Pass `null` to intentionally skip registration.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-panel')
class MyPanel extends LitElement {
  private panelRef = createRef<HTMLDivElement>()
  private escapeHotkey?: HotkeyController

  firstUpdated() {
    if (!this.panelRef.value) return

    this.escapeHotkey = new HotkeyController(
      this,
      'Escape',
      () => this.dispatchEvent(new CustomEvent('close')),
      { target: this.panelRef.value },
    )
    this.addController(this.escapeHotkey)
  }

  render() {
    return html`
      <div ${ref(this.panelRef)} tabindex="0">
        <p>Press Escape while focused here to close</p>
      </div>
    `
  }
}
```

> [!NOTE]
> When using a scoped target, make sure the element is focusable (has `tabindex`) so it can receive keyboard events.

### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options:

- `'warn'` (default): logs a warning but allows the registration
- `'error'`: throws an error
- `'replace'`: replaces the existing registration
- `'allow'`: allows multiple registrations silently

```ts
@hotkey('Mod+S', { conflictBehavior: 'replace' })
save() { saveDocument() }
```

### `platform`

Override the auto-detected platform. Useful for testing or for applications that need to force a specific platform behavior.

```ts
@hotkey('Mod+S', { platform: 'mac' })
save() { saveDocument() }
```
