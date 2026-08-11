# Lit adapter

Lit-specific setup and behavior.

<a id="source-hotkeys-docs-framework-lit-guides-formatting-display-md"></a>

## Formatting Display

Source: `hotkeys:docs/framework/lit/guides/formatting-display.md`.

TanStack Hotkeys provides several utilities for formatting hotkey strings into human-readable display text. These utilities handle platform differences automatically, so your UI shows the right symbols and labels for each operating system.

### `formatForDisplay`

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

#### Options

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

### `formatWithLabels`

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

### Using Formatted Hotkeys in Lit

#### Keyboard Shortcut Badges

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

#### Menu Items with Hotkeys

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

#### Command Palette Items

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

### Platform Symbols Reference

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

### Parsing and Normalization

TanStack Hotkeys also provides utilities for parsing and normalizing hotkey strings:

#### `parseHotkey`

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

#### `normalizeHotkey` and `normalizeRegisterableHotkey`

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

### Validation

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

<a id="source-hotkeys-docs-framework-lit-guides-hotkey-recording-md"></a>

## Hotkey Recording

Source: `hotkeys:docs/framework/lit/guides/hotkey-recording.md`.

TanStack Hotkeys provides the `HotkeyRecorderController` for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

### Basic Usage

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRecorderController, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('shortcut-recorder')
class ShortcutRecorder extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift+S"
    },
  })

  render() {
    const { isRecording, recordedHotkey } = this.recorder
    return html`
      <div>
        <button
          @click=${() =>
            isRecording
              ? this.recorder.stopRecording()
              : this.recorder.startRecording()}
        >
          ${isRecording
            ? 'Press a key combination...'
            : recordedHotkey
              ? formatForDisplay(recordedHotkey)
              : 'Click to record'}
        </button>
        ${isRecording
          ? html`<button @click=${() => this.recorder.cancelRecording()}>
              Cancel
            </button>`
          : nothing}
      </div>
    `
  }
}
```

### Controller API

`HotkeyRecorderController` exposes the following reactive getters and methods:

| Member | Type | Description |
|--------|------|-------------|
| `isRecording` | `boolean` (getter) | Whether the recorder is currently listening for key presses |
| `recordedHotkey` | `Hotkey \| null` (getter) | The last recorded hotkey string, or `null` if nothing recorded |
| `startRecording()` | `() => void` | Start listening for key presses |
| `stopRecording()` | `() => void` | Stop listening and keep the recorded hotkey |
| `cancelRecording()` | `() => void` | Stop listening and discard any recorded hotkey |
| `setOptions(opts)` | `(Partial<HotkeyRecorderOptions>) => void` | Update callbacks at runtime |

The controller registers itself with the host in its constructor, subscribes to the underlying `HotkeyRecorder` store on `hostConnected`, and cleans up on `hostDisconnected`.

### Options

Pass options as the second argument to the constructor:

```ts
new HotkeyRecorderController(this, {
  onRecord: (hotkey) => { /* called when a hotkey is recorded */ },
  onCancel: () => { /* called when recording is cancelled */ },
  onClear: () => { /* called when the recorded hotkey is cleared */ },
})
```

#### `onRecord`

Called when the user presses a valid key combination (a modifier + a non-modifier key, or a single non-modifier key). Receives the recorded `Hotkey` string.

#### `onCancel`

Called when recording is cancelled (either by pressing Escape or calling `cancelRecording()`).

#### `onClear`

Called when the recorded hotkey is cleared (by pressing Backspace or Delete during recording).

### Recording Behavior

The recorder has specific behavior for different keys:

| Key | Behavior |
|-----|----------|
| **Modifier only** (Shift, Ctrl, etc.) | Waits for a non-modifier key — modifier-only presses don't complete a recording |
| **Modifier + key** (e.g., Ctrl+S) | Records the full combination |
| **Single key** (e.g., Escape, F1) | Records the single key |
| **Escape** | Cancels the recording |
| **Backspace / Delete** | Clears the currently recorded hotkey |

#### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
new HotkeyRecorderController(this, {
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

#### Mod Auto-Conversion

Recorded hotkeys automatically use the portable `Mod` format. If a user on macOS presses Command+S, the recorded hotkey will be `Mod+S` rather than `Meta+S`. This ensures shortcuts are portable across platforms.

### Building a Shortcut Settings UI

Here's a more complete example of a shortcut customization panel:

```ts
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  HotkeyRecorderController,
  HotkeyController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { Hotkey } from '@tanstack/lit-hotkeys'

interface ShortcutMap {
  save: Hotkey
  undo: Hotkey
  search: Hotkey
}

@customElement('shortcut-settings')
class ShortcutSettings extends LitElement {
  @state() private shortcuts: ShortcutMap = {
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: 'Mod+K',
  }

  @state() private editingAction: keyof ShortcutMap | null = null

  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      if (this.editingAction) {
        this.shortcuts = { ...this.shortcuts, [this.editingAction]: hotkey }
        this.editingAction = null
      }
    },
    onCancel: () => {
      this.editingAction = null
    },
  })

  private saveCtrl?: HotkeyController
  private undoCtrl?: HotkeyController
  private searchCtrl?: HotkeyController

  connectedCallback() {
    super.connectedCallback()
    this._registerHotkeys()
  }

  updated() {
    this._unregisterHotkeys()
    this._registerHotkeys()
  }

  private _registerHotkeys() {
    this.saveCtrl = new HotkeyController(this, this.shortcuts.save, () => save())
    this.undoCtrl = new HotkeyController(this, this.shortcuts.undo, () => undo())
    this.searchCtrl = new HotkeyController(this, this.shortcuts.search, () => openSearch())
  }

  private _unregisterHotkeys() {
    this.saveCtrl?.hostDisconnected()
    this.undoCtrl?.hostDisconnected()
    this.searchCtrl?.hostDisconnected()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._unregisterHotkeys()
  }

  render() {
    return html`
      <div>
        <h2>Keyboard Shortcuts</h2>
        ${(Object.entries(this.shortcuts) as Array<[keyof ShortcutMap, Hotkey]>).map(
          ([action, hotkey]) => html`
            <div>
              <span>${action}</span>
              <button
                @click=${() => {
                  this.editingAction = action
                  this.recorder.startRecording()
                }}
              >
                ${this.editingAction === action && this.recorder.isRecording
                  ? 'Press keys...'
                  : formatForDisplay(hotkey)}
              </button>
            </div>
          `,
        )}
      </div>
    `
  }
}
```

### Under the Hood

The `HotkeyRecorderController` creates a `HotkeyRecorder` class instance and subscribes to its reactive state via the recorder's TanStack Store. The class manages its own keyboard event listeners and state, and the controller handles cleanup on disconnect.

<a id="source-hotkeys-docs-framework-lit-guides-hotkeys-md"></a>

## Hotkeys

Source: `hotkeys:docs/framework/lit/guides/hotkeys.md`.

The `@hotkey` decorator is the primary way to register keyboard shortcuts in Lit applications. It binds a hotkey to a class method, automatically registering when the element connects to the DOM and unregistering when it disconnects. For more dynamic use cases, the `HotkeyController` provides imperative control over hotkey registration.

Both approaches wrap the singleton `HotkeyManager` with automatic lifecycle management tied to Lit's `connectedCallback` / `disconnectedCallback`.

### Basic Usage

#### The `@hotkey` Decorator

Decorate any method to have it called when a hotkey is pressed:

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
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```ts
@hotkey('Mod+S')
save(event: KeyboardEvent, context: HotkeyCallbackContext) {
  console.log(context.hotkey)
  console.log(context.parsedHotkey)
}
```

#### The `HotkeyController`

For cases where you need to construct the hotkey dynamically or pass a callback that isn't a class method, use `HotkeyController` directly:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  private saveHotkey = new HotkeyController(
    this,
    'Mod+S',
    () => this.save(),
  )

  constructor() {
    super()
    this.addController(this.saveHotkey)
  }

  private save() {
    saveDocument()
  }

  render() {
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

### Default Options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```ts
@hotkey('Mod+S', {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined, // smart default: false for Mod+S, true for single keys
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
save() { /* ... */ }
```

If you omit `target`, the Lit adapter resolves it when the controller connects: it listens on `document` in the browser, and skips registration in non-DOM environments.

#### Why These Defaults?

Most hotkey registrations are intended to override default browser behavior — such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. To make this easy and consistent, the library sets `preventDefault` and `stopPropagation` to `true` by default, ensuring your hotkey handlers take precedence.

##### Smart Input Handling: `ignoreInputs`

The `ignoreInputs` option strikes a balance between accessibility and usability. By default, hotkeys involving `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key fire even when focus is inside input elements (text fields, text areas, etc.) and button-type inputs (`type="button"`, `"submit"`, or `"reset"`). Single key shortcuts or those using only `Shift`/`Alt` are ignored within non-button inputs to prevent interference with normal typing.

##### Hotkey Conflicts: `conflictBehavior`

When you register a hotkey that is already registered elsewhere in your app, the library logs a warning by default (`conflictBehavior: 'warn'`). This helps catch accidental duplicate bindings during development.

### Hotkey Options

#### `enabled`

Controls whether the hotkey is active. Defaults to `true`.

```ts
@hotkey('Mod+S', { enabled: true })
save() { saveDocument() }
```

#### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```ts
// Browser default is prevented (default behavior)
@hotkey('Mod+S')
save() { saveDocument() }

// Opt out when you want the browser's default behavior
@hotkey('Mod+P', { preventDefault: false })
print() { customPrint() }
```

#### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```ts
// Event propagation is stopped (default behavior)
@hotkey('Escape')
close() { closeModal() }

// Opt out when you need the event to bubble
@hotkey('Escape', { stopPropagation: false })
close() { closeModal() }
```

#### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```ts
// Fire when the key is released
@hotkey('Shift', { eventType: 'keyup' })
deactivateMode() { this.shiftMode = false }
```

#### `requireReset`

When `true`, the hotkey fires only once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```ts
// Only fires once per Escape press, not on key repeat
@hotkey('Escape', { requireReset: true })
closePanel() { this.panelOpen = false }
```

#### `ignoreInputs`

When `true`, the hotkey will not fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) are not ignored. When unset, a smart default applies: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

```ts
// Single key — ignored in inputs by default (smart default)
@hotkey('K')
openSearch() { /* ... */ }

// Mod+S and Escape — fire in inputs by default (smart default)
@hotkey('Mod+S')
save() { /* ... */ }

// Override: force a single key to fire in inputs
@hotkey('Enter', { ignoreInputs: false })
submit() { /* ... */ }
```

#### `target`

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

#### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options:

- `'warn'` (default) — Logs a warning but allows the registration
- `'error'` — Throws an error
- `'replace'` — Replaces the existing registration
- `'allow'` — Allows multiple registrations silently

```ts
@hotkey('Mod+S', { conflictBehavior: 'replace' })
save() { saveDocument() }
```

#### `platform`

Override the auto-detected platform. Useful for testing or for applications that need to force a specific platform behavior.

```ts
@hotkey('Mod+S', { platform: 'mac' })
save() { saveDocument() }
```

### Automatic Cleanup

Both the `@hotkey` decorator and `HotkeyController` automatically unregister the hotkey when the element is disconnected from the DOM:

```ts
@customElement('temporary-panel')
class TemporaryPanel extends LitElement {
  // Automatically registered on connect, unregistered on disconnect
  @hotkey('Escape')
  close() { this.remove() }

  render() {
    return html`<div>Panel content</div>`
  }
}
```

### Multiple Hotkeys

Register as many hotkeys as you need. Each `@hotkey` decorator is independent:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() { saveDocument() }

  @hotkey('Mod+Z')
  undo() { undoAction() }

  @hotkey('Mod+Shift+Z')
  redo() { redoAction() }

  @hotkey('Mod+F')
  search() { openSearch() }

  @hotkey('Escape')
  dismiss() { closeDialog() }
}
```

### Choosing Between Decorator and Controller

| | `@hotkey` Decorator | `HotkeyController` |
|---|---|---|
| **Best for** | Static, declarative method binding | Dynamic hotkeys, programmatic control |
| **Registration** | Automatic via `connectedCallback` | Automatic via `hostConnected` |
| **Cleanup** | Automatic via `disconnectedCallback` | Automatic via `hostDisconnected` |
| **Dynamic hotkeys** | No (hotkey is fixed at decoration time) | Yes (can construct hotkey at runtime) |
| **Callback binding** | Bound to the host element automatically | Bound to the host element automatically |

Use the `@hotkey` decorator for the common case of binding a static shortcut to a method. Use `HotkeyController` when you need to construct the hotkey string dynamically or manage registration imperatively.

### Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```ts
@hotkey('Mod+S', { meta: { name: 'Save', description: 'Save the document' } })
save() { saveDocument() }

// Or with HotkeyController:
new HotkeyController(this, 'Mod+S', () => this.save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name` and `description` fields. You can extend it with additional properties using TypeScript declaration merging:

```ts
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
    group?: string
  }
}

@hotkey('Mod+S', { meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' } })
save() { saveDocument() }
```

### Introspecting Registrations

Use `HotkeyRegistrationsController` to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyRegistrationsController } from '@tanstack/lit-hotkeys'

@customElement('shortcut-palette')
class ShortcutPalette extends LitElement {
  private registrations = new HotkeyRegistrationsController(this)

  render() {
    const { hotkeys, sequences } = this.registrations

    return html`
      <h2>Keyboard Shortcuts</h2>
      <ul>
        ${hotkeys.map(
          (reg) => html`
            <li>
              <kbd>${reg.hotkey}</kbd>
              ${reg.meta?.name ? html`<span> — ${reg.meta.name}</span>` : ''}
              ${reg.meta?.description ? html`<p>${reg.meta.description}</p>` : ''}
            </li>
          `,
        )}
      </ul>
      ${sequences.length > 0
        ? html`
            <h2>Sequences</h2>
            <ul>
              ${sequences.map(
                (reg) => html`
                  <li>
                    <kbd>${reg.sequence.join(' → ')}</kbd>
                    ${reg.meta?.name ? html`<span> — ${reg.meta.name}</span>` : ''}
                  </li>
                `,
              )}
            </ul>
          `
        : ''}
    `
  }
}
```

The controller exposes `hotkeys` and `sequences` arrays. The `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

### The Hotkey Manager

Under the hood, both the decorator and controller use the singleton `HotkeyManager`. You can access the manager directly when needed:

```ts
import { getHotkeyManager } from '@tanstack/lit-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements that have registered hotkeys receive listeners. This is more efficient than a single global listener.

<a id="source-hotkeys-docs-framework-lit-guides-key-state-tracking-md"></a>

## Key State Tracking

Source: `hotkeys:docs/framework/lit/guides/key-state-tracking.md`.

TanStack Hotkeys provides three Lit **reactive controllers** for tracking the real-time state of keyboard keys. These are useful for building UIs that respond to modifier keys being held, displaying active key states, or implementing hold-to-activate features.

### `HeldKeysController`

Tracks all currently held key names. Exposes a reactive **`value`** getter: `Array<string>`.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HeldKeysController } from '@tanstack/lit-hotkeys'

@customElement('key-display')
class KeyDisplay extends LitElement {
  private heldKeys = new HeldKeysController(this)

  render() {
    const keys = this.heldKeys.value
    return html`
      <div>
        ${keys.length > 0 ? `Held: ${keys.join(' + ')}` : 'No keys held'}
      </div>
    `
  }
}
```

The array contains key names like `'Shift'`, `'Control'`, `'Meta'`, `'A'`, `'ArrowUp'`, etc. Keys appear in the order they were pressed.

### `HeldKeyCodesController`

Tracks held key names mapped to physical key codes (`event.code`). Exposes **`value`**: `Record<string, string>`.

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HeldKeyCodesController } from '@tanstack/lit-hotkeys'

@customElement('key-code-display')
class KeyCodeDisplay extends LitElement {
  private heldKeyCodes = new HeldKeyCodesController(this)

  render() {
    const codes = this.heldKeyCodes.value
    // Example: { Shift: "ShiftLeft", Control: "ControlRight" }
    return html`
      <div>
        ${Object.entries(codes).map(
          ([key, code]) => html`<div>${key}: ${code}</div>`,
        )}
      </div>
    `
  }
}
```

Use this when you need to distinguish left vs. right modifiers (or other physical keys).

### `KeyHoldController`

Tracks whether **one** specific key is held. Exposes **`value`**: `boolean`. Updates the host only when **that** key’s held state changes (not on every unrelated key press).

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('modifier-indicators')
class ModifierIndicators extends LitElement {
  private shift = new KeyHoldController(this, 'Shift')
  private ctrl = new KeyHoldController(this, 'Control')
  private alt = new KeyHoldController(this, 'Alt')
  private meta = new KeyHoldController(this, 'Meta')

  render() {
    return html`
      <div class="modifier-bar">
        <span class=${this.shift.value ? 'active' : ''}>Shift</span>
        <span class=${this.ctrl.value ? 'active' : ''}>Ctrl</span>
        <span class=${this.alt.value ? 'active' : ''}>Alt</span>
        <span class=${this.meta.value ? 'active' : ''}>Meta</span>
      </div>
    `
  }
}
```

### Common patterns

#### Hold-to-reveal UI

Show extra actions while Shift is held:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('file-item')
class FileItem extends LitElement {
  @property({ type: String }) fileName = ''

  private shift = new KeyHoldController(this, 'Shift')

  render() {
    return html`
      <div class="file-item">
        <span>${this.fileName}</span>
        ${this.shift.value
          ? html`<button class="danger" @click=${this._permanentDelete}>
              Permanently Delete
            </button>`
          : html`<button @click=${this._moveToTrash}>Move to Trash</button>`}
      </div>
    `
  }

  private _permanentDelete = () => {
    /* permanentlyDelete(file) */
  }
  private _moveToTrash = () => {
    /* moveToTrash(file) */
  }
}
```

#### Keyboard shortcut hints

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { KeyHoldController } from '@tanstack/lit-hotkeys'

@customElement('shortcut-hints')
class ShortcutHints extends LitElement {
  private mod = new KeyHoldController(this, 'Meta') // use 'Control' on Windows if you prefer

  render() {
    if (!this.mod.value) return html``
    return html`
      <div class="shortcut-overlay">
        <div>S - Save</div>
        <div>Z - Undo</div>
        <div>Shift+Z - Redo</div>
        <div>K - Command Palette</div>
      </div>
    `
  }
}
```

#### Debugging key display

Combine controllers with [`formatForDisplay`](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-formatting-display-md) for readable labels:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  HeldKeysController,
  HeldKeyCodesController,
  formatForDisplay,
} from '@tanstack/lit-hotkeys'
import type { RegisterableHotkey } from '@tanstack/lit-hotkeys'

@customElement('key-debugger')
class KeyDebugger extends LitElement {
  private heldKeys = new HeldKeysController(this)
  private heldCodes = new HeldKeyCodesController(this)

  render() {
    const keys = this.heldKeys.value
    const codes = this.heldCodes.value
    return html`
      <div class="key-debugger">
        <h3>Active Keys</h3>
        ${keys.map(
          (key) => html`
            <div>
              <strong>
                ${formatForDisplay(key as RegisterableHotkey, {
                  useSymbols: true,
                })}
              </strong>
              <span class="code">${codes[key] ?? ''}</span>
            </div>
          `,
        )}
        ${keys.length === 0 ? html`<p>Press any key...</p>` : ''}
      </div>
    `
  }
}
```

### Platform quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

#### macOS modifier key behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event for the non-modifier key. TanStack Hotkeys detects and handles this automatically so held key state stays accurate.

#### Window blur

When the browser window loses focus, all held keys are automatically cleared. This prevents “stuck” keys after the user tabs away and releases keys outside the window.

### Under the hood

The three controllers subscribe to the singleton `KeyStateTracker` store from `@tanstack/hotkeys`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store, which the controllers read reactively.

```ts
import { getKeyStateTracker } from '@tanstack/lit-hotkeys'

const tracker = getKeyStateTracker()

tracker.getHeldKeys() // string[]
tracker.store.state.heldCodes // Record<string, string>
tracker.isKeyHeld('Shift') // boolean
tracker.isAnyKeyHeld(['Shift', 'Control']) // boolean
tracker.areAllKeysHeld(['Shift', 'Control']) // boolean
```

<a id="source-hotkeys-docs-framework-lit-guides-sequence-recording-md"></a>

## Sequence Recording

Source: `hotkeys:docs/framework/lit/guides/sequence-recording.md`.

TanStack Hotkeys provides the `HotkeySequenceRecorderController` for building UIs where users record **multi-chord sequences** (Vim-style shortcuts). Each step is captured like a single hotkey chord; users finish with **Enter** by default, or you can use manual commit and optional idle timeout.

### Basic Usage

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeySequenceRecorderController, formatForDisplay } from '@tanstack/lit-hotkeys'
import type { HotkeySequence } from '@tanstack/lit-hotkeys'

@customElement('sequence-recorder')
class SequenceRecorder extends LitElement {
  private recorder = new HotkeySequenceRecorderController(this, {
    onRecord: (sequence: HotkeySequence) => {
      console.log('Recorded:', sequence) // e.g., ["G", "G"]
    },
  })

  render() {
    const { isRecording, steps, recordedSequence } = this.recorder
    return html`
      <div>
        <button
          @click=${() =>
            isRecording
              ? this.recorder.cancelRecording()
              : this.recorder.startRecording()}
        >
          ${isRecording
            ? 'Press chords, then Enter…'
            : recordedSequence
              ? recordedSequence.map((h) => formatForDisplay(h)).join(' ')
              : 'Click to record'}
        </button>
        ${isRecording
          ? html`<button @click=${() => this.recorder.cancelRecording()}>
              Cancel
            </button>`
          : nothing}
      </div>
    `
  }
}
```

### Controller API

`HotkeySequenceRecorderController` exposes the following reactive getters and methods:

| Member | Type | Description |
|--------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is currently listening |
| `steps` | `HotkeySequence` | Chords captured in the current session |
| `recordedSequence` | `HotkeySequence \| null` | Last committed sequence |
| `startRecording()` | `() => void` | Start a new recording session |
| `stopRecording()` | `() => void` | Stop without calling `onRecord` |
| `cancelRecording()` | `() => void` | Stop and call `onCancel` |
| `commitRecording()` | `() => void` | Commit current `steps` (no-op if empty) |
| `setOptions(opts)` | `(Partial<HotkeySequenceRecorderOptions>) => void` | Update options at runtime |

The controller registers itself with the host in its constructor, subscribes to the underlying `HotkeySequenceRecorder` store on `hostConnected`, and cleans up on `hostDisconnected`.

### Options

Pass options as the second argument to the constructor:

```ts
new HotkeySequenceRecorderController(this, {
  onRecord: (sequence) => { /* called when a sequence is committed */ },
  onCancel: () => { /* called when recording is cancelled */ },
  onClear: () => { /* called when cleared via Backspace with no steps */ },
  commitKeys: 'enter', // or 'none'
  idleTimeoutMs: 2000,
})
```

#### `onRecord`

Called when a sequence is committed (including `[]` when cleared via Backspace with no steps). Receives the recorded `HotkeySequence` array.

#### `onCancel`

Called when recording is cancelled (either by pressing Escape or calling `cancelRecording()`).

#### `onClear`

Called when the sequence is cleared (by pressing Backspace or Delete during recording when no steps remain).

#### `commitKeys`

Controls how the user finishes recording from the keyboard:

- `'enter'` (default) — plain Enter (no modifiers) commits when at least one step exists.
- `'none'` — only `commitRecording()` or `idleTimeoutMs` finishes recording; plain Enter can be recorded as a chord.

#### `commitOnEnter`

When `commitKeys` is `'enter'`, set to `false` to treat Enter as a normal chord. Use `commitRecording()` or idle timeout to finish instead.

#### `idleTimeoutMs`

Milliseconds of inactivity **after the last completed chord** to auto-commit. The timer does not run while waiting for the **first** chord.

#### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```ts
new HotkeySequenceRecorderController(this, {
  ignoreInputs: false, // record even from inside inputs
  onRecord: (sequence) => console.log(sequence),
})
```

### Recording Behavior

| Input | Behavior |
|-------|----------|
| Valid chord | Appended to `steps`; listener stays active |
| Enter (no modifiers), `commitKeys: 'enter'`, `steps.length >= 1` | Commits and calls `onRecord` |
| Escape | Cancels; calls `onCancel` |
| Backspace / Delete (no modifiers) | Removes last step, or if empty runs `onClear` + `onRecord([])` and stops |

Recorded chords use portable `Mod` format, same as `HotkeyRecorderController`.

### Under the Hood

The `HotkeySequenceRecorderController` creates a `HotkeySequenceRecorder` class instance and subscribes to its reactive state via `@tanstack/store`. The class manages its own keyboard event listeners and state, and the controller handles cleanup on disconnect.

<a id="source-hotkeys-docs-framework-lit-guides-sequences-md"></a>

## Sequences

Source: `hotkeys:docs/framework/lit/guides/sequences.md`.

TanStack Hotkeys supports multi-key sequences -- shortcuts where you press keys one after another rather than simultaneously. This is commonly used for Vim-style navigation, cheat codes, or multi-step commands.

In Lit, registration is **declarative** via the `@hotkeySequence` decorator, or **imperative** via `HotkeySequenceController` when the sequence or options are built at runtime. Both use the same singleton `SequenceManager`.

### Basic Usage

#### The `@hotkeySequence` decorator

Decorate a method to run when the user completes the key sequence:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkeySequence } from '@tanstack/lit-hotkeys'

@customElement('vim-view')
class VimView extends LitElement {
  @hotkeySequence(['G', 'G'])
  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  render() {
    return html`<div>Press g then g to scroll to top</div>`
  }
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

The method receives the `KeyboardEvent` and [`HotkeyCallbackContext`](https://github.com/TanStack/hotkeys/blob/c73a3a167c979d500e1008341ecad096a6c4e635/docs/reference/interfaces/HotkeyCallbackContext.md) like `@hotkey`:

```ts
import type { HotkeyCallbackContext } from '@tanstack/lit-hotkeys'

@hotkeySequence(['G', 'G'])
scrollTop(event: KeyboardEvent, context: HotkeyCallbackContext) {
  console.log(context.hotkey)
}
```

#### `HotkeySequenceController`

Use the controller when the sequence or callback cannot be expressed as a static decorator (e.g. data-driven shortcuts):

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeySequenceController } from '@tanstack/lit-hotkeys'

@customElement('vim-view')
class VimView extends LitElement {
  private scrollTopSeq = new HotkeySequenceController(
    this,
    ['G', 'G'],
    () => this.scrollTop(),
  )

  constructor() {
    super()
    this.addController(this.scrollTopSeq)
  }

  private scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  render() {
    return html`<div>Press g then g to scroll to top</div>`
  }
}
```

### Many sequences at once

Register several sequences on the same element by applying **multiple** `@hotkeySequence` decorators (one per method), or by adding **multiple** `HotkeySequenceController` instances with `addController`. There is no Lit equivalent to React’s `useHotkeySequences` hook; several decorators on one class are the idiomatic pattern.

```ts
@customElement('vim-navigation')
class VimNavigation extends LitElement {
  @hotkeySequence(['G', 'G'])
  goTop() {
    scrollToTop()
  }

  @hotkeySequence(['G', 'Shift+G'])
  goBottom() {
    scrollToBottom()
  }

  @hotkeySequence(['D', 'D'], { timeout: 500 })
  deleteLine() {
    deleteCurrentLine()
  }

  render() {
    return html`<div></div>`
  }
}
```

### Sequence Options

Pass options as the **second** argument to `@hotkeySequence` (or to `HotkeySequenceController`):

```ts
@hotkeySequence(['G', 'G'], {
  timeout: 1000, // Time allowed between keys (ms)
  enabled: true, // Whether the sequence is active at connect time
})
scrollTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

#### `timeout`

The maximum time (in milliseconds) allowed between consecutive key presses. If the user takes longer than this between any two keys, the sequence resets. Defaults to `1000` (1 second).

```ts
@hotkeySequence(['D', 'D'], { timeout: 500 })
deleteLine() {
  deleteCurrentLine()
}

@hotkeySequence(['Shift+Z', 'Shift+Z'], { timeout: 2000 })
forceQuit() {
  quitWithoutSaving()
}
```

#### `enabled`

Controls whether the sequence is registered when the element connects. Defaults to `true`. If `enabled` is `false` at connection time, registration is skipped. To turn sequences on or off later, reconnect the element, or create a new `HotkeySequenceController` when your state changes.

```ts
@hotkeySequence(['G', 'G'], { enabled: true })
scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
```

#### Default options

When you omit options, the library uses the same defaults as the core [`SequenceOptions`](https://github.com/TanStack/hotkeys/blob/c73a3a167c979d500e1008341ecad096a6c4e635/docs/reference/interfaces/SequenceOptions.md): `timeout: 1000`, `preventDefault` / `stopPropagation` enabled, smart `ignoreInputs`, and platform auto-detection. If you omit `target`, the Lit adapter resolves it to `document` when the controller connects in the browser.

#### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```ts
@hotkeySequence(['G', 'G'], { meta: { name: 'Go to Top', description: 'Scroll to the top of the page' } })
scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }) }

// Or with HotkeySequenceController:
new HotkeySequenceController(this, ['G', 'G'], () => this.scrollTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-hotkeys-md) for details on declaration merging and introspecting registrations.

### Sequences with Modifiers

Each step in a sequence can include modifiers:

```ts
@hotkeySequence(['Mod+K', 'Mod+C'])
commentSelection() {
  commentSelection()
}

@hotkeySequence(['G', 'Shift+G'])
scrollBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}
```

### Chained modifier chords

You can repeat the same modifier across consecutive steps — for example `Shift+R` then `Shift+T`:

```ts
@hotkeySequence(['Shift+R', 'Shift+T'])
chordSequence() {
  runAfterChords()
}
```

#### Modifier-only keys between steps

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone, with no letter or other key) are ignored. They do not advance the sequence and they do **not** reset progress. That way a user can tap Shift (or hold it) between chords such as `Shift+R` and `Shift+T` without breaking the sequence — similar to Vim-style flows where a modifier may be pressed before the next chord.

### Common Sequence Patterns

#### Vim-style navigation

```ts
@customElement('vim-navigation')
class VimNavigation extends LitElement {
  @hotkeySequence(['G', 'G'])
  goTop() {
    scrollToTop()
  }

  @hotkeySequence(['G', 'Shift+G'])
  goBottom() {
    scrollToBottom()
  }

  @hotkeySequence(['D', 'D'])
  deleteLine() {
    deleteCurrentLine()
  }

  @hotkeySequence(['D', 'W'])
  deleteWord() {
    deleteCurrentWord()
  }

  @hotkeySequence(['C', 'I', 'W'])
  changeInnerWord() {
    changeInnerWordImpl()
  }

  render() {
    return html`<div></div>`
  }
}
```

#### Konami code

```ts
@hotkeySequence(
  [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'B',
    'A',
  ],
  { timeout: 2000 },
)
enableEasterEgg() {
  showEasterEgg()
}
```

#### Multi-step commands

```ts
@hotkeySequence(['H', 'E', 'L', 'P'])
openHelp() {
  showHelp()
}
```

### How sequences work

The `SequenceManager` (singleton) handles all sequence registrations. When a key is pressed:

1. It checks if the key matches the next expected step in any registered sequence
2. If it matches, the sequence advances to the next step
3. If the timeout expires between steps, the sequence resets
4. When all steps are completed, the callback fires
5. Modifier-only keydowns are ignored (they neither advance nor reset the sequence)

#### Overlapping sequences

Multiple sequences can share the same prefix. The manager tracks progress for each sequence independently:

```ts
@hotkeySequence(['D', 'D'])
dd() {
  deleteLine()
}

@hotkeySequence(['D', 'W'])
dw() {
  deleteWord()
}

@hotkeySequence(['D', 'I', 'W'])
diw() {
  deleteInnerWord()
}
```

After pressing `D`, the manager waits for the next key to determine which sequence to complete.

### The sequence manager

Under the hood, `@hotkeySequence` and `HotkeySequenceController` use the singleton `SequenceManager`. You can also use the core `createSequenceMatcher` function for standalone sequence matching without the singleton:

```ts
import { createSequenceMatcher } from '@tanstack/lit-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], {
  timeout: 1000,
})

document.addEventListener('keydown', (e) => {
  if (matcher.match(e)) {
    console.log('Sequence completed!')
  }
  console.log('Progress:', matcher.getProgress()) // e.g., 1/2
})
```

<a id="source-hotkeys-docs-framework-lit-quick-start-md"></a>

## Quick Start

Source: `hotkeys:docs/framework/lit/quick-start.md`.

### Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](./foundations.md#source-hotkeys-docs-installation-md) page for instructions.

### Your First Hotkey

The Lit adapter offers two ways to register hotkeys: **decorators** for declarative method-level binding, and **controllers** for imperative, reactive state management.

#### Using the `@hotkey` Decorator

The `@hotkey` decorator is the simplest way to bind a keyboard shortcut to a class method:

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
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

#### Using `HotkeyController`

For more control, use the `HotkeyController` directly:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { HotkeyController } from '@tanstack/lit-hotkeys'

@customElement('my-editor')
class MyEditor extends LitElement {
  private saveHotkey = new HotkeyController(
    this,
    'Mod+S',
    () => this.save(),
  )

  constructor() {
    super()
    this.addController(this.saveHotkey)
  }

  private save() {
    saveDocument()
  }

  render() {
    return html`<div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>`
  }
}
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

### Common Patterns

#### Multiple Hotkeys

Register as many hotkeys as you need with the `@hotkey` decorator:

```ts
@customElement('my-editor')
class MyEditor extends LitElement {
  @hotkey('Mod+S')
  save() { saveDocument() }

  @hotkey('Mod+Z')
  undo() { undoAction() }

  @hotkey('Mod+Shift+Z')
  redo() { redoAction() }

  @hotkey('Mod+F')
  search() { openSearch() }

  @hotkey('Escape')
  dismiss() { closeDialog() }
}
```

#### Scoped Hotkeys

Attach hotkeys to specific elements instead of the entire document using the `target` option. When the target comes from a ref, create the registration after the element has rendered:

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
      () => this.closePanel(),
      { target: this.panelRef.value },
    )
    this.addController(this.escapeHotkey)
  }

  private closePanel() {
    this.dispatchEvent(new CustomEvent('close'))
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

#### Conditional Hotkeys

Enable or disable hotkeys based on application state via the `enabled` option:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey } from '@tanstack/lit-hotkeys'

@customElement('my-modal')
class MyModal extends LitElement {
  @hotkey('Escape', { enabled: true })
  close() {
    this.dispatchEvent(new CustomEvent('close'))
  }
}
```

#### Multi-Key Sequences

Register Vim-style key sequences with the `@hotkeySequence` decorator or `HotkeySequenceController`:

```ts
import { LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkeySequence } from '@tanstack/lit-hotkeys'

@customElement('vim-editor')
class VimEditor extends LitElement {
  @hotkeySequence(['G', 'G'])
  scrollToTop() {
    window.scrollTo({ top: 0 })
  }

  @hotkeySequence(['G', 'Shift+G'])
  scrollToBottom() {
    window.scrollTo({ top: document.body.scrollHeight })
  }
}
```

#### Tracking Held Keys

Display modifier key state for power-user UIs using `KeyHoldController` and `HeldKeysController`:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { KeyHoldController, HeldKeysController } from '@tanstack/lit-hotkeys'

@customElement('status-bar')
class StatusBar extends LitElement {
  private shiftHold = new KeyHoldController(this, 'Shift')
  private heldKeys = new HeldKeysController(this)

  render() {
    return html`
      <div class="status-bar">
        ${this.shiftHold.value
          ? html`<span>Shift mode active</span>`
          : null}
        ${this.heldKeys.value.length > 0
          ? html`<span>Keys: ${this.heldKeys.value.join('+')}</span>`
          : null}
      </div>
    `
  }
}
```

#### Recording Hotkeys

Build shortcut customization UIs with `HotkeyRecorderController`:

```ts
import { LitElement, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
  HotkeyRecorderController,
  formatForDisplay,
  type Hotkey,
} from '@tanstack/lit-hotkeys'

@customElement('shortcut-settings')
class ShortcutSettings extends LitElement {
  private recorder = new HotkeyRecorderController(this, {
    onRecord: (hotkey) => {
      this.shortcut = hotkey
    },
    onCancel: () => {
      console.log('Recording cancelled')
    },
  })

  @state() private shortcut: Hotkey | null = null

  render() {
    return html`
      <button @click=${() => this.recorder.startRecording()}>
        ${this.recorder.isRecording ? 'Recording...' : 'Edit Shortcut'}
      </button>
      ${this.shortcut
        ? html`<kbd>${formatForDisplay(this.shortcut)}</kbd>`
        : nothing}
    `
  }
}
```

#### Displaying Hotkeys in the UI

Format hotkeys for platform-aware display:

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { hotkey, formatForDisplay } from '@tanstack/lit-hotkeys'

@customElement('save-button')
class SaveButton extends LitElement {
  @hotkey('Mod+S')
  save() { saveDocument() }

  render() {
    return html`
      <button>
        Save <kbd>${formatForDisplay('Mod+S')}</kbd>
        <!-- Mac: "⌘S"  |  Windows: "Ctrl+S" -->
      </button>
    `
  }
}
```

### Decorators vs Controllers

The Lit adapter provides two complementary approaches:

| | Decorators (`@hotkey`, `@hotkeySequence`) | Controllers (`HotkeyController`, etc.) |
|---|---|---|
| **Best for** | Declarative method binding | Reactive state, dynamic hotkeys |
| **Registration** | Automatic on connect/disconnect | Automatic via `hostConnected`/`hostDisconnected` |
| **State access** | No (fire-and-forget callbacks) | Yes (`isRecording`, `value`, etc.) |
| **Dynamic hotkeys** | No (static at decoration time) | Yes (can re-register programmatically) |

Use **decorators** when you simply want a method to fire on a key combo. Use **controllers** when you need reactive state (held keys, recording) or dynamic hotkey registration.

### Next Steps

- [Hotkeys Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-hotkeys-md) - Deep dive into `@hotkey` decorator and `HotkeyController` options
- [Sequences Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-sequences-md) - Multi-key sequence handling
- [Hotkey Recording Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-hotkey-recording-md) - Building shortcut customization UIs
- [Sequence Recording Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-sequence-recording-md) - Capture multi-step shortcuts
- [Key State Tracking Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-key-state-tracking-md) - Real-time key state monitoring
- [Formatting & Display Guide](./framework-lit.md#source-hotkeys-docs-framework-lit-guides-formatting-display-md) - Platform-aware hotkey formatting
