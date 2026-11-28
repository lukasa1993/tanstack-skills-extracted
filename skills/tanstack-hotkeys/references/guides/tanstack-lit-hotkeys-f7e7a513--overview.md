# Lit Hotkeys — Overview

[Guide and prerequisites](./tanstack-lit-hotkeys-f7e7a513.md) · Published skill · `@tanstack/lit-hotkeys@0.29.0`.

# TanStack Hotkeys in Lit

Before starting, load the `@tanstack/hotkeys#hotkeys-core` skill (`npx @tanstack/intent@latest load @tanstack/hotkeys#hotkeys-core`).

```ts no-check
import { HotkeyController, hotkey } from '@tanstack/lit-hotkeys'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('my-editor')
export class MyEditor extends LitElement {
  @state() private dirty = false

  @hotkey('Mod+K')
  openSearch() {}

  private saveHotkey = new HotkeyController(
    this,
    'Mod+S',
    () => this.save(),
    () => ({ enabled: this.dirty }),
  )

  save() {}

  render() {
    return html`<textarea @input=${() => (this.dirty = true)}></textarea>`
  }
}
```
