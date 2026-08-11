# Preact adapter

Preact-specific setup and behavior.

<a id="source-hotkeys-docs-framework-preact-guides-formatting-display-md"></a>

## Formatting Display

Source: `hotkeys:docs/framework/preact/guides/formatting-display.md`.

TanStack Hotkeys provides several utilities for formatting hotkey strings into human-readable display text. These utilities handle platform differences automatically, so your UI shows the right symbols and labels for each operating system.

### `formatForDisplay`

The primary formatting function. Returns a platform-aware string using symbols on macOS and text labels on Windows/Linux.

```tsx
import { formatForDisplay } from '@tanstack/preact-hotkeys'

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

On macOS, modifier order matches canonical normalization (same as `formatWithLabels`), and symbols are joined with **spaces** (e.g., `⌘ ⇧ Z`). On Windows and Linux, modifiers are joined with `+` (e.g., `Ctrl+Shift+Z`).

### `formatWithLabels`

Returns human-readable text labels (e.g., "Cmd" instead of the symbol). Useful when you want readable text rather than symbols.

```tsx
import { formatWithLabels } from '@tanstack/preact-hotkeys'

// On macOS:
formatWithLabels('Mod+S', { platform: 'mac' }) // "Cmd+S"
formatWithLabels('Mod+Shift+Z', { platform: 'mac' }) // "Cmd+Shift+Z"

// On Windows/Linux:
formatWithLabels('Mod+S', { platform: 'windows' }) // "Ctrl+S"
formatWithLabels('Mod+Shift+Z', { platform: 'windows' }) // "Ctrl+Shift+Z"
```

Modifier order matches canonical normalization from the core package.

### Using Formatted Hotkeys in Preact

#### Keyboard Shortcut Badges

```tsx
import { formatForDisplay } from '@tanstack/preact-hotkeys'

function ShortcutBadge({ hotkey }: { hotkey: string }) {
  return <kbd className="shortcut-badge">{formatForDisplay(hotkey)}</kbd>
}

// Usage
<ShortcutBadge hotkey="Mod+S" />      // Renders: ⌘ S (Mac) or Ctrl+S (Windows)
<ShortcutBadge hotkey="Mod+Shift+P" /> // Renders: ⌘ ⇧ P (Mac) or Ctrl+Shift+P (Windows)
```

#### Menu Items with Hotkeys

```tsx
import { useHotkey, formatForDisplay } from '@tanstack/preact-hotkeys'

function MenuItem({
  label,
  hotkey,
  onAction,
}: {
  label: string
  hotkey: string
  onAction: () => void
}) {
  useHotkey(hotkey, () => onAction())

  return (
    <div className="menu-item">
      <span>{label}</span>
      <span className="menu-shortcut">{formatForDisplay(hotkey)}</span>
    </div>
  )
}

// Usage
<MenuItem label="Save" hotkey="Mod+S" onAction={save} />
<MenuItem label="Undo" hotkey="Mod+Z" onAction={undo} />
<MenuItem label="Find" hotkey="Mod+F" onAction={openFind} />
```

#### Command Palette Items

```tsx
import { formatForDisplay } from '@tanstack/preact-hotkeys'
import type { Hotkey } from '@tanstack/preact-hotkeys'

interface Command {
  id: string
  label: string
  hotkey?: Hotkey
  action: () => void
}

function CommandPaletteItem({ command }: { command: Command }) {
  return (
    <div className="command-item" onClick={command.action}>
      <span>{command.label}</span>
      {command.hotkey && (
        <kbd>{formatForDisplay(command.hotkey)}</kbd>
      )}
    </div>
  )
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

Parse a hotkey string into its component parts:

```ts
import { parseHotkey } from '@tanstack/preact-hotkeys'

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
import { normalizeHotkey, normalizeRegisterableHotkey } from '@tanstack/preact-hotkeys'

normalizeHotkey('Cmd+S', 'mac')           // 'Mod+S'
normalizeHotkey('Ctrl+Shift+s', 'windows') // 'Mod+Shift+S'
normalizeHotkey('Shift+Meta+E', 'mac')    // 'Mod+Shift+E'

// String or RawHotkey — same string adapters use internally:
normalizeRegisterableHotkey({ key: 'S', mod: true, shift: true }, 'mac') // 'Mod+Shift+S'
```

Framework hooks normalize registerable hotkeys automatically via `normalizeRegisterableHotkey`.

### Validation

Use `validateHotkey` to check if a hotkey string is valid and get warnings about potential platform issues:

```ts
import { validateHotkey } from '@tanstack/preact-hotkeys'

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

<a id="source-hotkeys-docs-framework-preact-guides-hotkey-recording-md"></a>

## Hotkey Recording

Source: `hotkeys:docs/framework/preact/guides/hotkey-recording.md`.

TanStack Hotkeys provides the `useHotkeyRecorder` hook for building keyboard shortcut customization UIs. This lets users record their own shortcuts by pressing the desired key combination, similar to how system preferences or IDE shortcut editors work.

### Basic Usage

```tsx
import { useHotkeyRecorder, formatForDisplay } from '@tanstack/preact-hotkeys'

function ShortcutRecorder() {
  const { isRecording, recordedHotkey, startRecording, stopRecording, cancelRecording } =
    useHotkeyRecorder({
      onRecord: (hotkey) => {
        console.log('Recorded:', hotkey) // e.g., "Mod+Shift+S"
      },
    })

  return (
    <div>
      <button onClick={isRecording ? stopRecording : startRecording}>
        {isRecording
          ? 'Press a key combination...'
          : recordedHotkey
            ? formatForDisplay(recordedHotkey)
            : 'Click to record'}
      </button>
      {isRecording && (
        <button onClick={cancelRecording}>Cancel</button>
      )}
    </div>
  )
}
```

### Return Value

The `useHotkeyRecorder` hook returns an object with:

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is currently listening for key presses |
| `recordedHotkey` | `Hotkey \| null` | The last recorded hotkey string, or `null` if nothing recorded |
| `startRecording` | `() => void` | Start listening for key presses |
| `stopRecording` | `() => void` | Stop listening and keep the recorded hotkey |
| `cancelRecording` | `() => void` | Stop listening and discard any recorded hotkey |

### Options

```tsx
useHotkeyRecorder({
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

#### Global Default Options via Provider

You can set default options for all `useHotkeyRecorder` calls by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

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

The recorder has specific behavior for different keys:

| Key | Behavior |
|-----|----------|
| **Modifier only** (Shift, Ctrl, etc.) | Waits for a non-modifier key -- modifier-only presses don't complete a recording |
| **Modifier + key** (e.g., Ctrl+S) | Records the full combination |
| **Single key** (e.g., Escape, F1) | Records the single key |
| **Escape** | Cancels the recording |
| **Backspace / Delete** | Clears the currently recorded hotkey |

#### `ignoreInputs`

The `HotkeyRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

```tsx
useHotkeyRecorder({
  ignoreInputs: false, // record even from inside inputs
  onRecord: (hotkey) => console.log(hotkey),
})
```

#### Mod Auto-Conversion

Recorded hotkeys automatically use the portable `Mod` format. If a user on macOS presses Command+S, the recorded hotkey will be `Mod+S` rather than `Meta+S`. This ensures shortcuts are portable across platforms.

### Building a Shortcut Settings UI

Here's a more complete example of a shortcut customization panel:

```tsx
import { useState } from 'preact/hooks'
import {
  useHotkey,
  useHotkeyRecorder,
  formatForDisplay,
} from '@tanstack/preact-hotkeys'
import type { Hotkey } from '@tanstack/preact-hotkeys'

function ShortcutSettings() {
  const [shortcuts, setShortcuts] = useState<Record<string, Hotkey>>({
    save: 'Mod+S',
    undo: 'Mod+Z',
    search: 'Mod+K',
  })

  const [editingAction, setEditingAction] = useState<string | null>(null)

  const recorder = useHotkeyRecorder({
    onRecord: (hotkey) => {
      if (editingAction) {
        setShortcuts((prev) => ({ ...prev, [editingAction]: hotkey }))
        setEditingAction(null)
      }
    },
    onCancel: () => setEditingAction(null),
  })

  // Register the actual hotkeys with their current bindings
  useHotkey(shortcuts.save, () => save())
  useHotkey(shortcuts.undo, () => undo())
  useHotkey(shortcuts.search, () => openSearch())

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      {Object.entries(shortcuts).map(([action, hotkey]) => (
        <div key={action}>
          <span>{action}</span>
          <button
            onClick={() => {
              setEditingAction(action)
              recorder.startRecording()
            }}
          >
            {editingAction === action && recorder.isRecording
              ? 'Press keys...'
              : formatForDisplay(hotkey)}
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Under the Hood

The `useHotkeyRecorder` hook creates a `HotkeyRecorder` class instance and subscribes to its reactive state via `@tanstack/preact-store`. The class manages its own keyboard event listeners and state, and the hook handles cleanup on unmount.

<a id="source-hotkeys-docs-framework-preact-guides-hotkeys-md"></a>

## Hotkeys

Source: `hotkeys:docs/framework/preact/guides/hotkeys.md`.

The `useHotkey` hook is the primary way to register keyboard shortcuts in Preact applications. It wraps the singleton `HotkeyManager` with automatic lifecycle management, stale-closure prevention, and Preact ref support.

### Basic Usage

```tsx
import { useHotkey } from '@tanstack/preact-hotkeys'

function App() {
  useHotkey('Mod+S', () => {
    saveDocument()
  }, {
    // override the default options here
  })
}
```

The callback receives the original `KeyboardEvent` as the first argument and a `HotkeyCallbackContext` as the second:

```tsx
useHotkey('Mod+S', (event, context) => {
  console.log(context.hotkey)       // 'Mod+S'
  console.log(context.parsedHotkey) // { key: 'S', ctrl: false, shift: false, alt: false, meta: true, modifiers: ['Meta'] }
})
```

You can pass a hotkey as a string or as a `RawHotkey` object (modifier booleans optional). Use `mod` for cross-platform shortcuts (Command on Mac, Control elsewhere):

```tsx
useHotkey('Mod+S', () => save())
useHotkey({ key: 'S', mod: true }, () => save())           // Same as above
useHotkey({ key: 'Escape' }, () => closeModal())
useHotkey({ key: 'S', ctrl: true, shift: true }, () => saveAs())
useHotkey({ key: 'S', mod: true, shift: true }, () => saveAs())
```

### Default Options

When you register a hotkey without passing options, or when you omit specific options, the following defaults apply:

```tsx
useHotkey('Mod+S', callback, {
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

You can change the default options for all `useHotkey` calls in your app by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

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

Controls whether the hotkey is active. Defaults to `true`.

Disabled hotkeys **remain registered** in the manager and stay visible in devtools; only execution is suppressed. Hooks update `enabled` on the existing registration instead of unregistering and re-registering.

```tsx
const [isEditing, setIsEditing] = useState(false)

// Only active when editing
useHotkey('Mod+S', () => save(), { enabled: isEditing })
```

#### `preventDefault`

Automatically calls `event.preventDefault()` when the hotkey fires. Defaults to `true`.

```tsx
// Browser default is prevented by default
useHotkey('Mod+S', () => save())

// Opt out when you want the browser's default behavior
useHotkey('Mod+S', () => save(), { preventDefault: false })
```

#### `stopPropagation`

Calls `event.stopPropagation()` when the hotkey fires. Defaults to `true`.

```tsx
// Event propagation is stopped by default
useHotkey('Escape', () => closeModal())

// Opt out when you need the event to bubble
useHotkey('Escape', () => closeModal(), { stopPropagation: false })
```

#### `eventType`

Whether to listen on `keydown` (default) or `keyup`.

```tsx
// Fire when the key is released
useHotkey('Shift', () => deactivateMode(), { eventType: 'keyup' })
```

#### `requireReset`

When `true`, the hotkey will only fire once per key press. The key must be released and pressed again to fire again. Defaults to `false`.

```tsx
// Only fires once per Escape press, not on key repeat
useHotkey('Escape', () => closePanel(), { requireReset: true })
```

#### `ignoreInputs`

When `true`, the hotkey will not fire when the user is focused on a text input, textarea, select, or contentEditable element. Button-type inputs (`type="button"`, `"submit"`, `"reset"`) are not ignored, so shortcuts like Mod+S work when the user has tabbed to a form button. When unset, a smart default applies: `Ctrl`/`Meta` shortcuts and `Escape` fire in inputs; single keys and `Shift`/`Alt` combos are ignored.

```tsx
// Single key - ignored in inputs by default (smart default)
useHotkey('K', () => openSearch())

// Mod+S and Escape - fire in inputs by default (smart default)
useHotkey('Mod+S', () => save())
useHotkey('Escape', () => closeDialog())

// Override: force a single key to fire in inputs
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

Set `ignoreInputs: false` or `true` explicitly to override the smart default.

#### `target`

The DOM element to attach the event listener to. Defaults to `document`. Can be a DOM element, `document`, `window`, or a Preact ref.

```tsx
import { useRef } from 'preact/hooks'

function Panel() {
  const panelRef = useRef<HTMLDivElement | null>(null)

  // Only listens for events on this specific element
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      <p>Panel content</p>
    </div>
  )
}
```

> [!NOTE]
> When using a ref as the target, make sure the element is focusable (has `tabIndex`) so it can receive keyboard events.

#### `conflictBehavior`

Controls what happens when you register a hotkey that's already registered. Options:

- `'warn'` (default) - Logs a warning but allows the registration
- `'error'` - Throws an error
- `'replace'` - Replaces the existing registration
- `'allow'` - Allows multiple registrations silently

```tsx
useHotkey('Mod+S', () => save(), { conflictBehavior: 'replace' })
```

#### `platform`

Override the auto-detected platform. Useful for testing or for applications that need to force a specific platform behavior.

```tsx
useHotkey('Mod+S', () => save(), { platform: 'mac' })
```

### Stale Closure Prevention

The `useHotkey` hook automatically syncs the callback on every render, so you never need to worry about stale closures:

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // This callback always has access to the latest `count` value
  useHotkey('Mod+Shift+C', () => {
    console.log('Current count:', count)
  })

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```

### Automatic Cleanup

The hook automatically unregisters the hotkey when the component unmounts:

```tsx
function TemporaryPanel() {
  // Automatically cleaned up when this component unmounts
  useHotkey('Escape', () => closePanel())

  return <div>Panel content</div>
}
```

### Registering Multiple Hotkeys

When you need to register several hotkeys at once — or a dynamic, variable-length list — use the `useHotkeys` (plural) hook instead of calling `useHotkey` multiple times. This is especially useful when the number of shortcuts is not known at compile time, since calling hooks conditionally or in loops violates the rules of hooks.

```tsx
import { useHotkeys } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Escape', callback: () => close() },
  ])
}
```

#### Common Options with Per-Hotkey Overrides

Pass shared options as the second argument. Per-definition options override the common ones:

```tsx
useHotkeys(
  [
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo(), options: { enabled: false } },
  ],
  { preventDefault: true },
)
```

#### Dynamic Hotkey Lists

Because `useHotkeys` accepts a plain array, you can derive it from data:

```tsx
function MenuShortcuts({ items }) {
  useHotkeys(
    items.map((item) => ({
      hotkey: item.shortcut,
      callback: item.action,
      options: { enabled: item.enabled },
    })),
  )
}
```

The hook diffs the array between renders by array index plus the normalized hotkey string, registering new hotkeys and unregistering removed ones automatically. Reordering the array changes that identity, so reordered entries are unregistered and re-registered even if their callback references stay the same.

### Metadata (name & description)

Every hotkey registration can carry a `meta` object with a `name` and `description`. This metadata is informational only -- it does not affect hotkey behavior -- but it flows through to registrations and devtools, making it easy to build shortcut palettes and help screens.

```tsx
useHotkey('Mod+S', () => save(), {
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

useHotkey('Mod+S', () => save(), {
  meta: { name: 'Save', description: 'Save the document', icon: 'floppy', group: 'File' },
})
```

### Introspecting Registrations

Use the `useHotkeyRegistrations` hook to get a live view of all hotkey and sequence registrations. This is useful for building shortcut palettes, help dialogs, or devtools.

```tsx
import { useHotkeyRegistrations } from '@tanstack/preact-hotkeys'

function ShortcutPalette() {
  const { hotkeys, sequences } = useHotkeyRegistrations()

  return (
    <div>
      <h2>Keyboard Shortcuts</h2>
      <ul>
        {hotkeys.map((reg) => (
          <li key={reg.hotkey}>
            <kbd>{reg.hotkey}</kbd>
            {reg.meta?.name && <span> — {reg.meta.name}</span>}
            {reg.meta?.description && <p>{reg.meta.description}</p>}
          </li>
        ))}
      </ul>
      {sequences.length > 0 && (
        <>
          <h2>Sequences</h2>
          <ul>
            {sequences.map((reg) => (
              <li key={reg.sequence.join(' ')}>
                <kbd>{reg.sequence.join(' → ')}</kbd>
                {reg.meta?.name && <span> — {reg.meta.name}</span>}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
```

The returned `hotkeys` array contains registration objects with the hotkey string, options (including `meta`), and enabled state. The `sequences` array contains sequence registrations with the same structure.

### The Hotkey Manager

Under the hood, `useHotkey` uses the singleton `HotkeyManager`. You can also access the manager directly if needed:

```tsx
import { getHotkeyManager } from '@tanstack/preact-hotkeys'

const manager = getHotkeyManager()

// Check if a hotkey is registered
manager.isRegistered('Mod+S')

// Get total number of registrations
manager.getRegistrationCount()
```

The manager attaches event listeners per target element, so only elements that have registered hotkeys receive listeners. This is more efficient than a single global listener.

<a id="source-hotkeys-docs-framework-preact-guides-key-state-tracking-md"></a>

## Key State Tracking

Source: `hotkeys:docs/framework/preact/guides/key-state-tracking.md`.

TanStack Hotkeys provides three hooks for tracking the real-time state of keyboard keys. These are useful for building UIs that respond to modifier keys being held, displaying active key states, or implementing hold-to-activate features.

### `useHeldKeys`

Returns a reactive array of all currently held key names.

```tsx
import { useHeldKeys } from '@tanstack/preact-hotkeys'

function KeyDisplay() {
  const heldKeys = useHeldKeys()

  return (
    <div>
      {heldKeys.length > 0
        ? `Held: ${heldKeys.join(' + ')}`
        : 'No keys held'}
    </div>
  )
}
```

The returned array contains key names like `'Shift'`, `'Control'`, `'Meta'`, `'A'`, `'ArrowUp'`, etc. Keys appear in the order they were pressed.

### `useHeldKeyCodes`

Returns a reactive object mapping held key names to their physical key codes (`event.code` values). This is useful when you need to distinguish between left and right modifiers.

```tsx
import { useHeldKeyCodes } from '@tanstack/preact-hotkeys'

function KeyCodeDisplay() {
  const heldCodes = useHeldKeyCodes()
  // Example: { Shift: "ShiftLeft", Control: "ControlRight" }

  return (
    <div>
      {Object.entries(heldCodes).map(([key, code]) => (
        <div key={key}>
          {key}: {code}
        </div>
      ))}
    </div>
  )
}
```

### `useKeyHold`

Checks whether a specific key is currently held. This hook is optimized to only trigger re-renders when the specified key's held state changes, not when other keys are pressed or released.

```tsx
import { useKeyHold } from '@tanstack/preact-hotkeys'

function ModifierIndicators() {
  const isShiftHeld = useKeyHold('Shift')
  const isCtrlHeld = useKeyHold('Control')
  const isAltHeld = useKeyHold('Alt')
  const isMetaHeld = useKeyHold('Meta')

  return (
    <div className="modifier-bar">
      <span className={isShiftHeld ? 'active' : ''}>Shift</span>
      <span className={isCtrlHeld ? 'active' : ''}>Ctrl</span>
      <span className={isAltHeld ? 'active' : ''}>Alt</span>
      <span className={isMetaHeld ? 'active' : ''}>Meta</span>
    </div>
  )
}
```

### Common Patterns

#### Hold-to-Reveal UI

Show additional options while a modifier is held:

```tsx
import { useKeyHold } from '@tanstack/preact-hotkeys'

function FileItem({ file }: { file: File }) {
  const isShiftHeld = useKeyHold('Shift')

  return (
    <div className="file-item">
      <span>{file.name}</span>
      {isShiftHeld && (
        <button className="danger" onClick={() => permanentlyDelete(file)}>
          Permanently Delete
        </button>
      )}
      {!isShiftHeld && (
        <button onClick={() => moveToTrash(file)}>
          Move to Trash
        </button>
      )}
    </div>
  )
}
```

#### Keyboard Shortcut Hints

Display different shortcut hints based on which modifiers are held:

```tsx
import { useKeyHold } from '@tanstack/preact-hotkeys'

function ShortcutHints() {
  const isModHeld = useKeyHold('Meta') // or 'Control' on Windows

  if (!isModHeld) return null

  return (
    <div className="shortcut-overlay">
      <div>S - Save</div>
      <div>Z - Undo</div>
      <div>Shift+Z - Redo</div>
      <div>K - Command Palette</div>
    </div>
  )
}
```

#### Debugging Key Display

Combine hooks with formatting utilities for a rich debugging display:

```tsx
import {
  useHeldKeys,
  useHeldKeyCodes,
  formatForDisplay,
  type RegisterableHotkey,
} from '@tanstack/preact-hotkeys'

function KeyDebugger() {
  const heldKeys = useHeldKeys()
  const heldCodes = useHeldKeyCodes()

  return (
    <div className="key-debugger">
      <h3>Active Keys</h3>
      {heldKeys.map((key) => (
        <div key={key}>
          <strong>
            {formatForDisplay(key as RegisterableHotkey, { useSymbols: true })}
          </strong>
          <span className="code">{heldCodes[key]}</span>
        </div>
      ))}
      {heldKeys.length === 0 && <p>Press any key...</p>}
    </div>
  )
}
```

### Platform Quirks

The underlying `KeyStateTracker` handles several platform-specific issues:

#### macOS Modifier Key Behavior

On macOS, when a modifier key is held and a non-modifier key is pressed, the OS sometimes swallows the `keyup` event for the non-modifier key. TanStack Hotkeys detects and handles this automatically so held key state stays accurate.

#### Window Blur

When the browser window loses focus, all held keys are automatically cleared. This prevents "stuck" keys that would otherwise appear held even after the user tabs away and releases them.

### Under the Hood

All three hooks subscribe to the singleton `KeyStateTracker` via `@tanstack/preact-store`. The tracker manages its own event listeners on `document` and maintains state in a TanStack Store, which the hooks subscribe to reactively.

```tsx
import { getKeyStateTracker } from '@tanstack/preact-hotkeys'

const tracker = getKeyStateTracker()

// Imperative access (outside of Preact)
tracker.getHeldKeys()        // string[]
tracker.isKeyHeld('Shift')   // boolean
tracker.isAnyKeyHeld(['Shift', 'Control']) // boolean
tracker.areAllKeysHeld(['Shift', 'Control']) // boolean
```

<a id="source-hotkeys-docs-framework-preact-guides-sequence-recording-md"></a>

## Sequence Recording

Source: `hotkeys:docs/framework/preact/guides/sequence-recording.md`.

TanStack Hotkeys provides the `useHotkeySequenceRecorder` hook for building UIs where users record **multi-chord sequences** (Vim-style shortcuts). Each step is captured like a single hotkey chord; users finish with **Enter** by default, or you can use manual commit and optional idle timeout.

### Basic usage

```tsx
import { useHotkeySequenceRecorder, formatForDisplay } from '@tanstack/preact-hotkeys'
import type { HotkeySequence } from '@tanstack/preact-hotkeys'

function HotkeySequenceRecorder() {
  const recorder = useHotkeySequenceRecorder({
    onRecord: (sequence: HotkeySequence) => {
      console.log('Recorded:', sequence)
    },
  })

  return (
    <div>
      <button
        type="button"
        onClick={
          recorder.isRecording ? recorder.cancelRecording : recorder.startRecording
        }
      >
        {recorder.isRecording
          ? 'Press chords, then Enter…'
          : recorder.recordedSequence
            ? recorder.recordedSequence.map((h) => formatForDisplay(h)).join(' ')
            : 'Click to record'}
      </button>
      {recorder.isRecording && (
        <button type="button" onClick={recorder.cancelRecording}>
          Cancel
        </button>
      )}
    </div>
  )
}
```

### Return value

| Property | Type | Description |
|----------|------|-------------|
| `isRecording` | `boolean` | Whether the recorder is listening |
| `steps` | `HotkeySequence` | Chords captured in the current session |
| `recordedSequence` | `HotkeySequence \| null` | Last committed sequence |
| `startRecording` | `() => void` | Start a new session |
| `stopRecording` | `() => void` | Stop without calling `onRecord` |
| `cancelRecording` | `() => void` | Stop and call `onCancel` |
| `commitRecording` | `() => void` | Commit current `steps` (no-op if empty) |

### Options

Core options live on `HotkeySequenceRecorderOptions` from `@tanstack/hotkeys`:

- `onRecord(sequence)` — called when a sequence is committed (including `[]` when cleared via Backspace with no steps).
- `onCancel`, `onClear` — same intent as the hotkey recorder.
- `commitKeys` — `'enter'` (default) or `'none'`. With `'none'`, only `commitRecording()` (or `idleTimeoutMs`) finishes recording; plain Enter can be recorded as a chord.
- `commitOnEnter` — when `commitKeys` is `'enter'`, set to `false` to treat Enter as a normal chord (then use `commitRecording()` or idle timeout to finish).
- `idleTimeoutMs` — optional milliseconds of inactivity **after the last completed chord** to auto-commit. The timer does not run while waiting for the **first** chord.

#### Provider defaults

```tsx
<HotkeysProvider
  defaultOptions={{
    hotkeySequenceRecorder: {
      idleTimeoutMs: 2000,
    },
  }}
>
  <App />
</HotkeysProvider>
```

#### `ignoreInputs`

The `HotkeySequenceRecorderOptions` supports an `ignoreInputs` option (defaults to `true`). When `true`, the recorder will not intercept normal typing in text inputs, textareas, selects, or contentEditable elements -- keystrokes pass through to the input as usual. Pressing **Escape** still cancels recording even when focused on an input. Set `ignoreInputs: false` if you want the recorder to capture keys from within input elements.

### Behavior

| Input | Behavior |
|-------|----------|
| Valid chord | Appended to `steps`; listener stays active |
| Enter (no modifiers), `commitKeys: 'enter'`, `steps.length >= 1` | Commits and calls `onRecord` |
| Escape | Cancels; `onCancel` |
| Backspace / Delete (no modifiers) | Removes last step, or if empty runs `onClear` + `onRecord([])` and stops |

Recorded chords use portable `Mod` format, same as `HotkeyRecorder`.

### Under the hood

`useHotkeySequenceRecorder` wraps the `HotkeySequenceRecorder` class and subscribes to its TanStack Store, same pattern as `useHotkeyRecorder`.

<a id="source-hotkeys-docs-framework-preact-guides-sequences-md"></a>

## Sequences

Source: `hotkeys:docs/framework/preact/guides/sequences.md`.

TanStack Hotkeys supports multi-key sequences -- shortcuts where you press keys one after another rather than simultaneously. This is commonly used for Vim-style navigation, cheat codes, or multi-step commands.

### Basic Usage

Use the `useHotkeySequence` hook to register a key sequence:

```tsx
import { useHotkeySequence } from '@tanstack/preact-hotkeys'

function App() {
  // Vim-style: press g then g to scroll to top
  useHotkeySequence(['G', 'G'], () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}
```

The first argument is an array of `Hotkey` strings representing each step in the sequence. The user must press them in order within the timeout window.

### Many sequences at once

When you need several sequences—or a **dynamic** list whose length is not fixed at compile time—use `useHotkeySequences` instead of calling `useHotkeySequence` many times. One hook call keeps you within the rules of hooks while still registering every sequence.

```tsx
import { useHotkeySequences } from '@tanstack/preact-hotkeys'

useHotkeySequences([
  { sequence: ['G', 'G'], callback: () => scrollToTop() },
  { sequence: ['D', 'D'], callback: () => deleteLine(), options: { timeout: 500 } },
])
```

Options merge in the same order as `useHotkeys`: `HotkeysProvider` defaults, then the second-argument `commonOptions`, then each definition’s `options`.

### Sequence Options

The third argument is an options object:

```tsx
useHotkeySequence(['G', 'G'], callback, {
  timeout: 1000,  // Time allowed between keys (ms)
  enabled: true,  // Whether the sequence is active
  target: document, // Or a Preact ref for scoped sequences
})
```

#### `timeout`

The maximum time (in milliseconds) allowed between consecutive key presses. If the user takes longer than this between any two keys, the sequence resets. Defaults to `1000` (1 second).

```tsx
// Fast sequence - user must type quickly
useHotkeySequence(['D', 'D'], () => deleteLine(), { timeout: 500 })

// Slow sequence - user has more time between keys
useHotkeySequence(['Shift+Z', 'Shift+Z'], () => forceQuit(), { timeout: 2000 })
```

#### `enabled`

Controls whether the sequence is active. Defaults to `true`.

Disabled sequences **remain registered** and stay visible in devtools; only execution is suppressed.

```tsx
const [isVimMode, setIsVimMode] = useState(true)

useHotkeySequence(['G', 'G'], () => scrollToTop(), { enabled: isVimMode })
```

#### `target`

The DOM element to attach the sequence listener to. Defaults to `document`. Can be a Preact ref, DOM element, `document`, or `window` for scoped sequences.

#### Global Default Options via Provider

You can set default options for all `useHotkeySequence` calls by wrapping your component tree with `HotkeysProvider`. Per-hook options will override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

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
useHotkeySequence(['G', 'G'], () => scrollToTop(), {
  meta: { name: 'Go to Top', description: 'Scroll to the top of the page' },
})
```

See the [Hotkeys Guide](./framework-preact.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md) for details on declaration merging and introspecting registrations.

### Sequences with Modifiers

Each step in a sequence can include modifiers:

```tsx
// Ctrl+K followed by Ctrl+C (VS Code-style comment)
useHotkeySequence(['Mod+K', 'Mod+C'], () => {
  commentSelection()
})

// g then Shift+G (go to bottom, Vim-style)
useHotkeySequence(['G', 'Shift+G'], () => {
  scrollToBottom()
})
```

### Chained modifier chords

You can repeat the same modifier across consecutive steps—for example `Shift+R` then `Shift+T`:

```tsx
useHotkeySequence(['Shift+R', 'Shift+T'], () => {
  doNextAction()
})
```

#### Modifier-only keys between steps

While a sequence is in progress, **modifier-only** keydown events (Shift, Control, Alt, or Meta pressed alone, with no letter or other key) are ignored. They do not advance the sequence and they do **not** reset progress. That way a user can tap Shift (or hold it) between chords such as `Shift+R` and `Shift+T` without breaking the sequence—similar to Vim-style flows where a modifier may be pressed before the next chord.

### Common Sequence Patterns

#### Vim-Style Navigation

```tsx
function VimNavigation() {
  useHotkeySequence(['G', 'G'], () => scrollToTop())
  useHotkeySequence(['G', 'Shift+G'], () => scrollToBottom())
  useHotkeySequence(['D', 'D'], () => deleteLine())
  useHotkeySequence(['D', 'W'], () => deleteWord())
  useHotkeySequence(['C', 'I', 'W'], () => changeInnerWord())
}
```

#### Konami Code

```tsx
useHotkeySequence(
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
// Press "h", "e", "l", "p" to open help
useHotkeySequence(['H', 'E', 'L', 'P'], () => openHelp())
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
// Both share the 'D' prefix
useHotkeySequence(['D', 'D'], () => deleteLine())   // dd
useHotkeySequence(['D', 'W'], () => deleteWord())    // dw
useHotkeySequence(['D', 'I', 'W'], () => deleteInnerWord()) // diw
```

After pressing `D`, the manager waits for the next key to determine which sequence to complete.

### The Sequence Manager

Under the hood, `useHotkeySequence` uses the singleton `SequenceManager`. You can also use the core `createSequenceMatcher` function for standalone sequence matching without the singleton:

```tsx
import { createSequenceMatcher } from '@tanstack/preact-hotkeys'

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
