# Solid adapter

Solid-specific setup and behavior.

<a id="source-hotkeys-docs-framework-solid-guides-formatting-display-md"></a>

## Formatting Display

Source: `hotkeys:docs/framework/solid/guides/formatting-display.md`.

TanStack Hotkeys provides several utilities for formatting hotkey strings into human-readable display text. These utilities handle platform differences automatically, so your UI shows the right symbols and labels for each operating system.

### `formatForDisplay`

The primary formatting function. Returns a platform-aware string using symbols on macOS and text labels on Windows/Linux.

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'

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
  platform: 'mac',
  useSymbols: true,
})
```

On macOS, modifier order matches canonical normalization (same as `formatWithLabels`), with **spaces** between symbol segments.

### `formatWithLabels`

Returns human-readable text labels (e.g., "Cmd" instead of the symbol).

```tsx
import { formatWithLabels } from '@tanstack/solid-hotkeys'

formatWithLabels('Mod+S', { platform: 'mac' }) // "Cmd+S"
formatWithLabels('Mod+S', { platform: 'windows' }) // "Ctrl+S"
formatWithLabels('Mod+Shift+Z', { platform: 'mac' }) // "Cmd+Shift+Z"
formatWithLabels('Mod+Shift+Z', { platform: 'windows' }) // "Ctrl+Shift+Z"
```

### Using Formatted Hotkeys in Solid

#### Keyboard Shortcut Badges

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutBadge(props: { hotkey: string }) {
  return <kbd class="shortcut-badge">{formatForDisplay(props.hotkey)}</kbd>
}
```

#### Menu Items with Hotkeys

```tsx
import { createHotkey, formatForDisplay } from '@tanstack/solid-hotkeys'

function MenuItem(props: {
  label: string
  hotkey: string
  onAction: () => void
}) {
  createHotkey(props.hotkey, () => props.onAction())

  return (
    <div class="menu-item">
      <span>{props.label}</span>
      <span class="menu-shortcut">{formatForDisplay(props.hotkey)}</span>
    </div>
  )
}
```

#### Command Palette Items

```tsx
import { formatForDisplay } from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

interface Command {
  id: string
  label: string
  hotkey?: Hotkey
  action: () => void
}

function CommandPaletteItem(props: { command: Command }) {
  return (
    <div class="command-item" onClick={props.command.action}>
      <span>{props.command.label}</span>
      <Show when={props.command.hotkey}>
        <kbd>{formatForDisplay(props.command.hotkey!)}</kbd>
      </Show>
    </div>
  )
}
```

### Platform Symbols Reference

| Modifier | Mac Symbol | Windows/Linux Label |
|----------|-----------|-------------------|
| Meta (Cmd) | `⌘` | `Win` / `Super` |
| Control | `⌃` | `Ctrl` |
| Alt/Option | `⌥` | `Alt` |
| Shift | `⇧` | `Shift` |

### Parsing and Normalization

#### `parseHotkey`

```ts
import { parseHotkey } from '@tanstack/solid-hotkeys'

const parsed = parseHotkey('Mod+Shift+S')
// { key: 'S', ctrl: false, shift: true, alt: false, meta: true, modifiers: [...] }
```

#### `normalizeHotkey` and `normalizeRegisterableHotkey`

Core helpers produce a **canonical** hotkey string for storage and registration. When the platform allows `Mod`, the output uses `Mod` and **Mod-first** order.

```ts
import { normalizeHotkey, normalizeRegisterableHotkey } from '@tanstack/solid-hotkeys'

normalizeHotkey('Cmd+S', 'mac')           // 'Mod+S'
normalizeHotkey('Ctrl+Shift+s', 'windows') // 'Mod+Shift+S'

normalizeRegisterableHotkey({ key: 'S', mod: true, shift: true }, 'mac') // 'Mod+Shift+S'
```

Solid primitives normalize registerable hotkeys automatically via `normalizeRegisterableHotkey`.

### Validation

Use `validateHotkey` to check if a hotkey string is valid and get warnings about potential platform issues:

```ts
import { validateHotkey } from '@tanstack/solid-hotkeys'

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

<a id="source-hotkeys-docs-framework-solid-guides-hotkey-recording-md"></a>

## Hotkey Recording

Source: `hotkeys:docs/framework/solid/guides/hotkey-recording.md`.

TanStack Hotkeys provides the `createHotkeyRecorder` primitive for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

### Basic Usage

```tsx
import { createHotkeyRecorder, formatForDisplay } from '@tanstack/solid-hotkeys'

function ShortcutRecorder() {
  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      console.log('Recorded:', hotkey) // e.g., "Mod+Shift+S"
    },
  })

  return (
    <div>
      <button onClick={() => recorder.isRecording() ? recorder.stopRecording() : recorder.startRecording()}>
        {recorder.isRecording()
          ? 'Press a key combination...'
          : recorder.recordedHotkey()
            ? formatForDisplay(recorder.recordedHotkey()!)
            : 'Click to record'}
      </button>
      <Show when={recorder.isRecording()}>
        <button onClick={recorder.cancelRecording}>Cancel</button>
      </Show>
    </div>
  )
}
```

> [!NOTE]
> In Solid, `isRecording` and `recordedHotkey` are **accessors** (signal getters). You must call them with `()` to read the value: `recorder.isRecording()`, `recorder.recordedHotkey()`.

### Return Value

The `createHotkeyRecorder` primitive returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `() => boolean` | Accessor returning whether the recorder is currently listening |
| `recordedHotkey` | `() => Hotkey \| null` | Accessor returning the last recorded hotkey, or `null` |
| `startRecording` | `() => void` | Start listening for key presses |
| `stopRecording` | `() => void` | Stop listening and keep the recorded hotkey |
| `cancelRecording` | `() => void` | Stop listening and discard any recorded hotkey |

### Options

```tsx
createHotkeyRecorder({
  onRecord: (hotkey) => { /* called when a hotkey is recorded */ },
  onCancel: () => { /* called when recording is cancelled */ },
  onClear: () => { /* called when the recorded hotkey is cleared */ },
})
```

Options can also be passed as an accessor function for reactive configuration.

#### `onRecord`

Called when the user presses a valid key combination. Receives the recorded `Hotkey` string.

#### `onCancel`

Called when recording is cancelled (Escape or `cancelRecording()`).

#### `onClear`

Called when the recorded hotkey is cleared (Backspace or Delete during recording).

#### Global Default Options via Provider

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkeyRecorder: {
      onCancel: () => console.log('Recording cancelled'),
    },
  }}
>
  <App />
</HotkeysProvider>
```

### Recording Behavior

| Key | Behavior |
|-----|----------|
| **Modifier only** | Waits for a non-modifier key |
| **Modifier + key** | Records the full combination |
| **Single key** | Records the single key |
| **Escape** | Cancels the recording |
| **Backspace / Delete** | Clears the currently recorded hotkey |

#### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```tsx
createHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

#### Mod Auto-Conversion

Recorded hotkeys automatically use the portable `Mod` format (Command on Mac, Control elsewhere).

### Building a Shortcut Settings UI

```tsx
import { createSignal } from 'solid-js'
import {
  createHotkey,
  createHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/solid-hotkeys'
import type { Hotkey } from '@tanstack/solid-hotkeys'

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = createSignal<Record<string, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: 'Mod+K',
  })

  const [editingAction, setEditingAction] = createSignal<string | null>(null)

  const recorder = createHotkeyRecorder({
    onRecord: (hotkey) => {
      const action = editingAction()
      if (action) {
        setShortcuts((prev) => ({ ...prev, [action]: hotkey }))
        setEditingAction(null)
      }
    },
    onCancel: () => setEditingAction(null),
  })

  // Register the actual hotkeys with their current bindings
  createHotkey(() => shortcuts().save, () => save())
  createHotkey(() => shortcuts().undo, () => undo())
  createHotkey(() => shortcuts().search, () => openSearch())

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <For each={Object.entries(shortcuts())}>
        {([action, hotkey]) => (
          <div>
            <span>{action}</span>
            <button
              onClick={() => {
                setEditingAction(action)
                recorder.startRecording()
              }}
            >
              {editingAction() === action && recorder.isRecording()
                ? 'Press keys...'
                : formatForDisplay(hotkey)}
            </button>
          </div>
        )}
      </For>
    </div>
  )
}
```

### Under the Hood

The `createHotkeyRecorder` primitive creates a `HotkeyRecorder` class instance and subscribes to its reactive state via `@tanstack/solid-store`. The class manages its own keyboard event listeners and state, and the primitive handles cleanup when the component is disposed.

<a id="source-hotkeys-docs-framework-solid-guides-hotkeys-md"></a>

## Hotkeys

Source: `hotkeys:docs/framework/solid/guides/hotkeys.md`.

The `createHotkey` primitive is the primary way to register keyboard shortcuts in SolidJS applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management and reactive option support.

### Basic Usage

```tsx
import { createHotkey } from '@tanstack/solid-hotkeys'

function App() {
  createHotkey('Mod+S', () => {
    saveDocument()
  }, {
    // override the default options here
  })
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```tsx
createHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)       // 'Mod+S'
  console.log(context.parsedHotkey) // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
})
```

You can pass a hotkey as a string or as a `RawHotkey` object (modifier booleans optional). Use `mod` for cross-platform shortcuts (Command on Mac, Control elsewhere):

```tsx
createHotkey('Mod+S', () => save())
createHotkey({ key: 'S', mod: true }, () => save())           // Same as above
createHotkey({ key: 'Escape' }, () => closeModal())
createHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
createHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```

### Reactive Options

Unlike React/Preact hooks, Solid primitives accept **accessor functions** for reactive options. Pass a function that returns the options object to have the hotkey automatically update when dependencies change:

```tsx
function Modal(props) {
  createHotkey('Escape', () => props.onClose(), () => ({
    enabled: props.isOpen,
  }))

  return (
    <Show when={props.isOpen}>
      <div class="modal">...</div>
    </Show>
  )
}
```

For scoped targets, use an accessor so the hotkey waits for the element to be attached:

```tsx
function Editor() {
  const [editorRef, setEditorRef] = createSignal<HTMLDivElement | null>(null)

  createHotkey('Mod+S', save, () => ({ target: editorRef() }))

  return <div ref={setEditorRef}>...</div>
}
```

### Default Options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```tsx
createHotkey('Mod+S', callback, {
  enabled: true,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown',
  requireReset: false,
  ignoreInputs: undefined, // smart default: false for Mod+S, true for single keys
  target: document,
  platform: undefined, // auto-detected
  conflictBehavior: 'warn',
})
```

#### Why These Defaults?

Most hotkey registrations are intended to override default browser behavior—such as using `Mod+S` to save a document instead of showing the browser's "Save Page" dialog. To make this easy and consistent, the library sets `preventDefault` and `stopPropagation` to `true` by default, ensuring your hotkey handlers take precedence and reducing the amount of repetitive boilerplate code required.

##### Smart Input Handling: `ignoreInputs`

The `ignoreInputs` option is designed to strike a balance between accessibility and usability. By default, hotkeys involving `Ctrl`/`Meta` modifiers (like `Mod+S`) and the `Escape` key are allowed to fire even when the focus is inside input elements (such as text fields or text areas), and when focused on button-type inputs (`type="button"`, `"submit"`, or `"reset"`). This allows shortcuts like save or close to work wherever the user is focused. On the other hand, single key shortcuts or those using only `Shift`/`Alt` are ignored within non-button inputs to prevent interference with normal typing.

##### Hotkey Conflicts: `conflictBehavior`

When you attempt to register a hotkey that is already registered (possibly in another part of your app), the library logs a warning by default using the `conflictBehavior: 'warn'` setting. This helps you catch accidental duplicate bindings during development so they can be resolved before reaching production.

#### Global Default Options via Provider

You can change the default options for all `createHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-primitive options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkey: { preventDefault: false, ignoreInputs: false },
  }}
>
  <App />
</HotkeysProvider>
```

### Hotkey Options

#### `enabled`

Controls whether the hotkey is active. Defaults to `true`. Use an accessor for reactive control.

Disabled hotkeys **remain registered** in the manager and stay visible in devtools; only execution is suppressed.

```tsx
const [isEditing, setIsEditing] = createSignal(false)

createHotkey('Mod+S', () => save(), () => ({ enabled: isEditing() }))
```

#### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```tsx
createHotkey('Mod+S', () => save())
createHotkey('Mod+S', () => save(), { preventDefault: false })
```

#### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```tsx
createHotkey('Escape', () => closeModal())
createHotkey('Escape', () => closeModal(), { stopPropagation: false })
```

#### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```tsx
createHotkey('Shift', () => deactivateMode(), { eventType: 'keyup' })
```

#### `requireReset`

When `true`, the hotkey will only fire once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
createHotkey('Escape', () => closePanel(), { requireReset: true })
```

#### `ignoreInputs`

When `true`, the hotkey will not fire when the user is focused on a text input, textarea, select, or contentEditable element. When unset, a smart default applies based on the hotkey type.

```tsx
createHotkey('K', () => openSearch())  // Smart default: ignored in inputs
createHotkey('Mod+S', () => save())   // Smart default: fires in inputs
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

#### `target`

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or from an accessor for reactive targets.

```tsx
const [panelRef, setPanelRef] = createSignal<HTMLDivElement | null>(null)

createHotkey('Escape', () => closePanel(), () => ({ target: panelRef() }))

return <div ref={setPanelRef} tabIndex={0}>...</div>
```

> [!NOTE]
> When using an accessor for the target, the primitive waits for the element to be available before registering. Ensure the element is focusable (has `tabIndex`) so it can receive keyboard events.

#### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options: `'warn'`, `'error'`, `'replace'`, `'allow'`.

```tsx
createHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

#### `platform`

Override the auto-detected platform.

```tsx
createHotkey('Mod+S', () => save(), { platform: 'mac' })
```

### Automatic Dependency Tracking

Solid's fine-grained reactivity means `createHotkey` automatically tracks reactive dependencies. The callback always has access to the latest signal values:

```tsx
function Counter() {
  const [count, setCount] = createSignal(0)

  createHotkey('Mod+Shift+C', () => {
    console.log('Current count:', count())
  })

  return <button onClick={() => setCount(c => c + 1)}>Count: {count()}</button>
}
```

### Automatic Cleanup

The primitive automatically unregisters the hotkey when the component unmounts (when the owning reactive scope is disposed):

```tsx
function TemporaryPanel() {
  createHotkey('Escape', () => closePanel())
  return <div>Panel content</div>
}
```

### Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use the `createHotkeys` (plural) primitive:

```tsx
import { createHotkeys } from '@tanstack/solid-hotkeys'

function Editor() {
  createHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

#### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```tsx
createHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

#### Dynamic Hotkey Lists

Pass an accessor for reactive arrays:

```tsx
function MenuShortcuts(props) {
  createHotkeys(
    () => props.items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
}
```

The primitive tracks dependencies automatically and diffs registrations when the array changes.

### Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```tsx
createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document' },
})
```

The `meta` option is typed as `HotkeyMeta`, which ships with `name` and `description` fields. You can extend it with additional properties using TypeScript declaration merging:

```tsx
declare module '@tanstack/hotkeys' {
  interface HotkeyMeta {
    icon?: string
    group?: string
  }
}

createHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

### Introspecting Registrations

Use the `createHotkeyRegistrations` primitive to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```tsx
import { createHotkeyRegistrations } from '@tanstack/solid-hotkeys'

function ShortcutPalette() {
  const registrations = createHotkeyRegistrations()

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <ul>
        <For each={registrations().hotkeys}>
          {(reg) => (
            <li>
              <kbd>{reg.hotkey}</kbd>
              {reg.meta?.name && <span> — {reg.meta.name}</span>}
              {reg.meta?.description && <p>{reg.meta.description}</p>}
            </li>
          )}
        </For>
      </ul>
      <Show when={registrations().sequences.length > 0}>
        <h2>Sequences</h2>
        <ul>
          <For each={registrations().sequences}>
            {(reg) => (
              <li>
                <kbd>{reg.sequence.join(' → ')}</kbd>
                {reg.meta?.name && <span> — {reg.meta.name}</span>}
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
```

The returned accessor provides an object with a `hotkeys` array containing registration objects with the hotkey string, options (including `meta`), and enabled state, and a `sequences` array containing sequence registrations with the same structure.

### The Hotkey Manager

Under the hood, `createHotkey` uses the singleton `HotkeyManager`. You can also access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/solid-hotkeys'

const manager = getHotkeyManager()
manager.isRegistered('Mod+S')
manager.getRegistrationCount()
```

<a id="source-hotkeys-docs-framework-solid-guides-key-state-tracking-md"></a>

## Key State Tracking

Source: `hotkeys:docs/framework/solid/guides/key-state-tracking.md`.

TanStack Hotkeys provides three primitives for tracking the real-time state of keyboard keys. These are useful for building UIs that respond to modifier keys being held, displaying active key states, or implementing hold-to-activate features.

### `createHeldKeys`

Returns an accessor that yields an array of all currently held key names.

```tsx
import { createHeldKeys } from '@tanstack/solid-hotkeys'

function KeyDisplay() {
  const heldKeys = createHeldKeys()

  return (
    <div>
      {heldKeys().length > 0
        ? `Held: ${heldKeys().join(' + ')}`
        : 'No keys held'}
    </div>
  )
}
```

> [!NOTE]
> In Solid, `createHeldKeys()` returns an **accessor function**. Call it with `()` to read the current value: `heldKeys()`.

The returned array contains key names like `'Shift'`, `'Control'`, `'Meta'`, `'A'`, `'ArrowUp'`, etc. Keys appear in the order they were pressed.

### `createHeldKeyCodes`

Returns an accessor that yields a reactive object mapping held key names to their physical key codes (`event.code` values). Useful for distinguishing between left and right modifiers.

```tsx
import { createHeldKeyCodes } from '@tanstack/solid-hotkeys'

function KeyCodeDisplay() {
  const heldCodes = createHeldKeyCodes()
  // Example: { Shift: "ShiftLeft", Control: "ControlRight" }

  return (
    <div>
      <For each={Object.entries(heldCodes())}>
        {([key, code]) => (
          <div>
            {key}: {code}
          </div>
        )}
      </For>
    </div>
  )
}
```

### `createKeyHold`

Returns an accessor that indicates whether a specific key is currently held. Optimized to only trigger updates when the specified key's held state changes. The `key` argument can be a string or an accessor for reactive keys.

```tsx
import { createKeyHold } from '@tanstack/solid-hotkeys'

function ModifierIndicators() {
  const isShiftHeld = createKeyHold('Shift')
  const isCtrlHeld = createKeyHold('Control')
  const isAltHeld = createKeyHold('Alt')
  const isMetaHeld = createKeyHold('Meta')

  return (
    <div class="modifier-bar">
      <span classList={{ active: isShiftHeld() }}>Shift</span>
      <span classList={{ active: isCtrlHeld() }}>Ctrl</span>
      <span classList={{ active: isAltHeld() }}>Alt</span>
      <span classList={{ active: isMetaHeld() }}>Meta</span>
    </div>
  )
}
```

### Common Patterns

#### Hold-to-Reveal UI

```tsx
import { createKeyHold } from '@tanstack/solid-hotkeys'

function FileItem(props: { file: File }) {
  const isShiftHeld = createKeyHold('Shift')

  return (
    <div class="file-item">
      <span>{props.file.name}</span>
      <Show when={isShiftHeld()}>
        <button class="danger" onClick={() => permanentlyDelete(props.file)}>
          Permanently Delete
        </button>
      </Show>
      <Show when={!isShiftHeld()}>
        <button onClick={() => moveToTrash(props.file)}>
          Move to Trash
        </button>
      </Show>
    </div>
  )
}
```

#### Keyboard Shortcut Hints

```tsx
import { createKeyHold } from '@tanstack/solid-hotkeys'

function ShortcutHints() {
  const isModHeld = createKeyHold('Meta')

  return (
    <Show when={isModHeld()}>
      <div class="shortcut-overlay">
        <div>S - Save</div>
        <div>Z - Undo</div>
        <div>Shift+Z - Redo</div>
        <div>K - Command Palette</div>
      </div>
    </Show>
  )
}
```

#### Debugging Key Display

```tsx
import {
  createHeldKeys,
  createHeldKeyCodes,
  formatForDisplay,
  type RegisterableHotkey,
} from '@tanstack/solid-hotkeys'

function KeyDebugger() {
  const heldKeys = createHeldKeys()
  const heldCodes = createHeldKeyCodes()

  return (
    <div class="key-debugger">
      <h3>Active Keys</h3>
      <For each={heldKeys()}>
        {(key) => (
          <div>
            <strong>
              {formatForDisplay(key as RegisterableHotkey, { useSymbols: true })}
            </strong>
            <span class="code">{heldCodes()[key]}</span>
          </div>
        )}
      </For>
      <Show when={heldKeys().length === 0}>
        <p>Press any key...</p>
      </Show>
    </div>
  )
}
```

### Platform Quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

#### macOS Modifier Key Behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event. TanStack Hotkeys detects and handles this automatically.

#### Window Blur

When the browser window loses focus, all held keys are automatically cleared.

### Under the Hood

All three primitives subscribe to the singleton `KeyStateTracker` via `@tanstack/solid-store`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store.

```tsx
import { getKeyStateTracker } from '@tanstack/solid-hotkeys'

const tracker = getKeyStateTracker()

tracker.getHeldKeys()        // string[]
tracker.isKeyHeld('Shift')   // boolean
tracker.isAnyKeyHeld(['Shift', 'Control']) // boolean
tracker.areAllKeysHeld(['Shift', 'Control']) // boolean
```

<a id="source-hotkeys-docs-framework-solid-guides-sequence-recording-md"></a>

## Sequence Recording

Source: `hotkeys:docs/framework/solid/guides/sequence-recording.md`.

Use `createHotkeySequenceRecorder` from `@tanstack/solid-hotkeys` to record multi-chord sequences. API mirrors `createHotkeyRecorder`: accessors `isRecording`, `steps`, `recordedSequence`, plus `startRecording`, `stopRecording`, `cancelRecording`, `commitRecording`.

Options and keyboard behavior are the same as the core `HotkeySequenceRecorder` class (`commitKeys`, `commitOnEnter`, `idleTimeoutMs`, Enter / Escape / Backspace). Set provider defaults with `HotkeysProvider` `defaultOptions.hotkeySequenceRecorder`.

#### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

<a id="source-hotkeys-docs-framework-solid-guides-sequences-md"></a>

## Sequences

Source: `hotkeys:docs/framework/solid/guides/sequences.md`.

TanStack Hotkeys supports multi-key sequences -- shortcuts where you press keys one after another rather than simultaneously. This is commonly used for Vim-style navigation, cheat codes, or multi-step commands.

### Basic Usage

Use the `createHotkeySequence` primitive to register a key sequence:

```tsx
import { createHotkeySequence } from '@tanstack/solid-hotkeys'

function App() {
  // Vim-style: press g then g to scroll to top
  createHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

### Many sequences at once

For several sequences or a **dynamic** list, use `createHotkeySequences` instead of many `createHotkeySequence` calls. Pass a plain array or an accessor that returns definitions.

```tsx
import { createHotkeySequences } from '@tanstack/solid-hotkeys'

createHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
```

Options merge like `createHotkeys`: `HotkeysProvider` defaults, then `commonOptions`, then each definition’s `options`. For element-scoped multi-sequence registration, use `createHotkeySequencesAttachment`.

### Reactive Options

Solid's `createHotkeySequence` accepts **accessor functions** for reactive sequence and options:

```tsx
const [isVimMode, setIsVimMode] = createSignal(true)
const [sequence] = createSignal(['G', 'G'] as const)

createHotkeySequence(
  sequence,
  () => scrollToTop(),
  () => ({ enabled: isVimMode(), timeout: 1500 }),
)
```

### Sequence Options

The third argument is an options object (or accessor returning options):

```tsx
createHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,  // Time allowed between keys (ms)
  enabled: true,  // Whether the sequence is active
  target: document, // Or from an accessor for scoped sequences
})
```

#### `timeout`

The maximum time (in milliseconds) allowed between consecutive key presses. Defaults to `1000` (1 second).

```tsx
createHotkeySequence(['D', 'D'], () => deleteLine(), { timeout: 500 })
createHotkeySequence(['Shift+Z', 'Shift+Z'], () => forceQuit(), { timeout: 2000 })
```

#### `enabled`

Controls whether the sequence is active. Defaults to `true`. Use an accessor for reactive control.

Disabled sequences **remain registered** and stay visible in devtools; only execution is suppressed.

```tsx
const [isVimMode, setIsVimMode] = createSignal(true)

createHotkeySequence(['G', 'G'], () => scrollToTop(), () => ({
  enabled: isVimMode(),
}))
```

#### `target`

The DOM element to attach the sequence listener to. Defaults to `document`. Can be from an accessor when the target becomes available after mount.

#### Global Default Options via Provider

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

<HotkeysProvider
  defaultOptions={{
    hotkeySequence: { timeout: 1500 },
  }}
>
  <App />
</HotkeysProvider>
```

#### `meta`

Sequences support the same `meta` option as hotkeys, allowing you to attach a `name` and `description` for use in shortcut palettes and devtools.

```tsx
createHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./framework-solid.md#source-hotkeys-docs-framework-solid-guides-hotkeys-md) for details on declaration merging and introspecting registrations.

### Sequences with Modifiers

Each step in a sequence can include modifiers:

```tsx
createHotkeySequence(['Mod+K', 'Mod+C'], () => commentSelection())
createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
```

### Chained modifier chords

You can repeat the same modifier across consecutive steps—for example `Shift+R` then `Shift+T`:

```tsx
createHotkeySequence(['Shift+R', 'Shift+T'], () => {
  doNextAction()
})
```

#### Modifier-only keys between steps

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone, with no letter or other key) are ignored. They do not advance the sequence and they do **not** reset progress, so a user can tap or hold Shift between chords without breaking the sequence.

### Common Sequence Patterns

#### Vim-Style Navigation

```tsx
function VimNavigation() {
  createHotkeySequence(['G', 'G'], () => scrollToTop())
  createHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
  createHotkeySequence(['D', 'D'], () => deleteLine())
  createHotkeySequence(['D', 'W'], () => deleteWord())
  createHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
}
```

#### Konami Code

```tsx
createHotkeySequence(
  [
    'ArrowUp', 'ArrowUp',
    'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight',
    'ArrowLeft', 'ArrowRight',
    'B', 'A',
  ],
  () => enableEasterEgg(),
  { timeout: 2000 },
)
```

#### Multi-Step Commands

```tsx
createHotkeySequence(['H', 'E', 'L', 'P'], () => openHelp())
```

### How Sequences Work

The `SequenceManager` (singleton) handles all sequence registrations. When a key is pressed:

1. It checks if the key matches the next expected step in any registered sequence
2. If it matches, the sequence advances to the next step
3. If the timeout expires between steps, the sequence resets
4. When all steps are completed, the callback fires
5. Modifier-only keydowns are ignored (they neither advance nor reset the sequence)

#### Overlapping Sequences

Multiple sequences can share the same prefix. The manager tracks progress for each sequence independently:

```tsx
createHotkeySequence(['D', 'D'], () => deleteLine())
createHotkeySequence(['D', 'W'], () => deleteWord())
createHotkeySequence(['D', 'I', 'W'], () => deleteInnerWord())
```

### The Sequence Manager

Under the hood, `createHotkeySequence` uses the singleton `SequenceManager`. You can also use the core `createSequenceMatcher` function for standalone sequence matching:

```tsx
import { createSequenceMatcher } from '@tanstack/solid-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (e) => {
  if (matcher.match(e)) {
    console.log('Sequence completed!')
  }
  console.log('Progress:', matcher.getProgress())
})
```
