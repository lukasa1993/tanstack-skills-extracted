# Formatting Display

<a id="source-hotkeys-docs-framework-lit-guides-formatting-display-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.8.0`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

TanStack Hotkeys provides several utilities for formatting hotkey strings into human-readable display text. These utilities handle platform differences automatically, so your UI shows the right symbols and labels for each operating system.

## `formatForDisplay`

The primary formatting function. Returns a platform-aware string using symbols on macOS and text labels on Windows/Linux.

```ts
import { formatForDisplay } from '@tanstack/lit-hotkeys'

// On macOS (symbols separated by spaces):
formatForDisplay('Mod+S')         // "⌘ S"
formatForDisplay('Mod+Shift+Z')   // "⌘ ⇧ Z"
formatForDisplay('Control+Alt+D') // "⌃ ⌥ D"

// On Windows/Linux:
formatForDisplay('Mod+S')         // "Ctrl+S"
formatForDisplay('Mod+Shift+Z')   // "Ctrl+Shift+Z"
formatForDisplay('Control+Alt+D') // "Ctrl+Alt+D"
```

### Options

```ts
formatForDisplay('Mod+S', {
  platform: 'mac', // Override platform detection ('mac' | 'windows' | 'linux')
  useSymbols: true, // default; set false for text labels on macOS
})
```

On macOS, modifier **order** matches canonical normalization (same as `formatWithLabels`), and symbols are joined with **spaces** (e.g., `⌘ ⇧ Z`). On Windows and Linux, modifiers are joined with `+` (e.g., `Ctrl+Shift+Z`).

`platform` is used for both normalization and display. If you need to show the same [`ParsedHotkey`](https://github.com/TanStack/hotkeys/blob/c73a3a167c979d500e1008341ecad096a6c4e635/docs/reference/interfaces/ParsedHotkey.md) under several platforms, first serialize with the platform it was parsed with, then format for each display platform:

```ts
import {
  formatForDisplay,
  normalizeHotkeyFromParsed,
  parseHotkey,
} from '@tanstack/lit-hotkeys'

const parsed = parseHotkey('Mod+K', 'mac')
const canonical = normalizeHotkeyFromParsed(parsed, 'mac')
formatForDisplay(canonical, { platform: 'windows' }) // "Ctrl+K"
```

## `formatWithLabels`

Returns human-readable text labels (e.g., "Cmd" instead of the symbol). Useful when you want readable text rather than symbols.

```ts
import { formatWithLabels } from '@tanstack/lit-hotkeys'

// On macOS:
formatWithLabels('Mod+S', { platform: 'mac' }) // "Cmd+S"
formatWithLabels('Mod+Shift+Z', { platform: 'mac' }) // "Cmd+Shift+Z"

// On Windows/Linux:
formatWithLabels('Mod+S', { platform: 'windows' }) // "Ctrl+S"
formatWithLabels('Mod+Shift+Z', { platform: 'windows' }) // "Ctrl+Shift+Z"
```

Modifier order matches canonical normalization from the core package (e.g. `Mod` first, then `Shift`, then the key).

## Using Formatted Hotkeys in Lit

### Keyboard Shortcut Badges

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-badge')
class ShortcutBadge extends LitElement {
  @property({ type: String }) hotkey = ''

  render() {
    return html`<kbd class="shortcut-badge">${formatForDisplay(this.hotkey)}</kbd>`
  }
}
```
Usage:
```html
<shortcut-badge hotkey="Mod+S"></shortcut-badge>        <!-- ⌘ S (Mac) or Ctrl+S (Windows) -->
<shortcut-badge hotkey="Mod+Shift+P"></shortcut-badge>  <!-- ⌘ ⇧ P (Mac) or Ctrl+Shift+P (Windows) -->
```

### Menu Items with Hotkeys

`HotkeyController` registers the shortcut; `formatForDisplay` renders the label in the template.

```ts
import { LitElement, html } from 'lit'
import type { PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { HotkeyController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('menu-item')
class MenuItem extends LitElement {
  @property({ type: String }) label = ''

  @property({ type: String }) hotkey = ''

  private hotkeyController?: HotkeyController

  updated(changedProperties: PropertyValues<this>) {
    if (!changedProperties.has('hotkey')) return

    if (this.hotkeyController) {
      this.hotkeyController.hostDisconnected()
      this.removeController(this.hotkeyController)
      this.hotkeyController = undefined
    }

    if (!this.hotkey) return

    this.hotkeyController = new HotkeyController(this, this.hotkey, () =>
      this.dispatchEvent(
        new CustomEvent('action', { bubbles: true, composed: true }),
      ),
    )
    this.addController(this.hotkeyController)
  }

  render() {
    return html`
      <div class="menu-item">
        <span>${this.label}</span>
        <span class="menu-shortcut">${formatForDisplay(this.hotkey)}</span>
      </div>
    `
  }
}
```

Usage:
```ts
html`
  <menu-item label="Save" hotkey="Mod+S" @action=${save}></menu-item>
  <menu-item label="Undo" hotkey="Mod+Z" @action=${undo}></menu-item>
  <menu-item label="Find" hotkey="Mod+F" @action=${find}></menu-item>
`
```

### Command Palette Items

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { formatForDisplay } from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

interface Command {
  id: string
  label: string
  hotkey?: Hotkey
  action: () => void
}

@customElement('command-palette-item')
class CommandPaletteItem extends LitElement {
  @property({ type: Object }) command!: Command

  render() {
    const { label, hotkey, action } = this.command
    return html`
      <div class="command-item" @click=${action}>
        <span>${label}</span>
        ${hotkey ? html`<kbd>${formatForDisplay(hotkey)}</kbd>` : nothing}
      </div>
    `
  }
}
```

## Platform Symbols Reference

On macOS, modifiers are displayed as symbols:

| Modifier | Mac Symbol | Windows/Linux Label |
|----------|-----------|-------------------|
| Meta (Cmd) | `⌘` | `Win` / `Super` |
| Control | `⌃` | `Ctrl` |
| Alt/Option | `⌥` | `Alt` |
| Shift | `⇧` | `Shift` |

Special keys also have display symbols:

| Key | Display |
|-----|---------|
| Escape | `Esc` |
| Backspace | `⌫` (Mac) / `Backspace` |
| Delete | `⌦` (Mac) / `Del` |
| Enter | `↵` |
| Tab | `⇥` |
| ArrowUp | `↑` |
| ArrowDown | `↓` |
| ArrowLeft | `←` |
| ArrowRight | `→` |
| Space | `Space` |

## Parsing and Normalization

TanStack Hotkeys also provides utilities for parsing and normalizing hotkey strings:

### `parseHotkey`

Parse a hotkey string into its components:

```ts
import { parseHotkey } from '@tanstack/lit-hotkeys'

const parsed = parseHotkey('Mod+Shift+S')
// {
//   key: 'S',
//   ctrl: false,   // true on Windows/Linux
//   shift: true,
//   alt: false,
//   meta: true,    // true on Mac
//   modifiers: ['Shift', 'Meta']  // or ['Control', 'Shift'] on Windows
// }
```

### `normalizeHotkey` and `normalizeRegisterableHotkey`

Core helpers produce a **canonical** hotkey string for storage and registration. When the platform allows `Mod` (Command on Mac without Control; Control on Windows/Linux without Meta), the output uses `Mod` and **Mod-first** modifier order (`Mod+Shift+E`), not expanded `Meta`/`Control`.

```ts
import { normalizeHotkey, normalizeRegisterableHotkey } from '@tanstack/lit-hotkeys'

normalizeHotkey('Cmd+S', 'mac')           // 'Mod+S'
normalizeHotkey('Ctrl+Shift+s', 'windows') // 'Mod+Shift+S'
normalizeHotkey('Shift+Meta+E', 'mac')    // 'Mod+Shift+E'

// String or RawHotkey — same string adapters use internally:
normalizeRegisterableHotkey({ key: 'S', mod: true, shift: true }, 'mac') // 'Mod+Shift+S'
```

The Lit integration (`HotkeyController`, `@hotkey`) normalizes registerable hotkeys automatically via `normalizeRegisterableHotkey`.

## Validation

Use `validateHotkey` to check if a hotkey string is valid and get warnings about potential platform issues:

```ts
import { validateHotkey } from '@tanstack/lit-hotkeys'

const result = validateHotkey('Alt+A')
// {
//   valid: true,
//   warnings: ['Alt+letter combinations may not work on macOS due to special characters'],
//   errors: []
// }

const result2 = validateHotkey('InvalidKey+S')
// {
//   valid: false,
//   warnings: [],
//   errors: ['Unknown key: InvalidKey']
// }
```
