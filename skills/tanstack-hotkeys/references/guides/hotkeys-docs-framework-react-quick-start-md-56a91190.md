# Quick Start

<a id="source-hotkeys-docs-framework-react-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.14.0`.

[Topic index](../framework-react.md) · [Source provenance](../SOURCES.md)

## Installation

Don't have TanStack Hotkeys installed yet? See the [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md) page for instructions.

## Your first hotkey

The `useHotkey` hook is the primary way to register keyboard shortcuts in React:

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function App() {
  useHotkey('Mod+S', () => {
    saveDocument()
  })

  return <div>Press Cmd+S (Mac) or Ctrl+S (Windows) to save</div>
}
```

The `Mod` modifier automatically resolves to `Meta` (Command) on macOS and `Control` on Windows/Linux, so your shortcuts work across platforms without extra logic.

## Common patterns

### Multiple hotkeys

Register as many hotkeys as you need. Each `useHotkey` call is independent:

```tsx
function Editor() {
  useHotkey('Mod+S', () => save())
  useHotkey('Mod+Z', () => undo())
  useHotkey('Mod+Shift+Z', () => redo())
  useHotkey('Mod+F', () => openSearch())
  useHotkey('Escape', () => closeDialog())

  return <div>Editor with keyboard shortcuts</div>
}
```

### Scoped hotkeys with refs

Attach hotkeys to specific elements instead of the entire document:

```tsx
import { useRef } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // This hotkey only fires when the panel (or its children) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      <p>Press Escape while focused here to close</p>
    </div>
  )
}
```

### Conditional hotkeys

Enable or disable hotkeys based on application state:

```tsx
function Modal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useHotkey('Escape', () => onClose(), { enabled: isOpen })

  if (!isOpen) return null

  return (
    <div className="modal">
      <p>Press Escape to close</p>
    </div>
  )
}
```

### Multi-key sequences

Pass an array of chords to register a Vim-style sequence:

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function VimStyleApp() {
  useHotkey(['G', 'G'], () => scrollToTop())
  useHotkey(['G', 'Shift+G'], () => scrollToBottom())

  return <div>Use gg to go to top, gG to go to bottom</div>
}
```

### Tracking held keys

Display modifier key state for power-user UIs:

```tsx
import { useKeyHold, useHeldKeys } from '@tanstack/react-hotkeys'

function StatusBar() {
  const isShiftHeld = useKeyHold('Shift')
  const heldKeys = useHeldKeys()

  return (
    <div className="status-bar">
      {isShiftHeld && <span>Shift mode active</span>}
      {heldKeys.length > 0 && <span>Keys: {heldKeys.join('+')}</span>}
    </div>
  )
}
```

### Displaying hotkeys in the UI

Format hotkeys for platform-aware display:

```tsx
import { useHotkey, formatForDisplay } from '@tanstack/react-hotkeys'

function SaveButton() {
  useHotkey('Mod+S', () => save())

  return (
    <button>
      Save <kbd>{formatForDisplay('Mod+S')}</kbd>
      {/* Mac: "⌘ S"  |  Windows: "Ctrl+S" */}
    </button>
  )
}
```

## Setting up devtools

Add the TanStack Devtools to your app to inspect registered hotkeys, view held keys, and test shortcuts:

```tsx
import { TanStackDevtools } from '@tanstack/react-devtools'
import { hotkeysDevtoolsPlugin } from '@tanstack/react-hotkeys-devtools'

function App() {
  return (
    <div>
      {/* Your app */}
      <TanStackDevtools plugins={[hotkeysDevtoolsPlugin()]} />
    </div>
  )
}
```

## Declaring app hotkeys

To list every hotkey in a cheat sheet, including those on routes that have not rendered, and to let users customize them, declare them once and pass them to `HotkeysProvider`:

```tsx
import {
  HotkeysProvider,
  defineAppHotkeys,
  useAppHotkeys,
  useHotkey,
} from '@tanstack/react-hotkeys'

const appHotkeys = defineAppHotkeys({
  'doc.save': { hotkey: 'Mod+S', meta: { name: 'Save' } },
  'nav.home': { hotkey: ['G', 'H'], meta: { name: 'Go home' } },
})

function Root() {
  return (
    <HotkeysProvider appHotkeys={appHotkeys}>
      <Editor />
    </HotkeysProvider>
  )
}

function Editor() {
  const hotkeys = useAppHotkeys()
  useHotkey(hotkeys['doc.save'], () => save())
  return <div>Editor</div>
}
```

See the [App Hotkeys Guide](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md) for cheat sheets and saving custom hotkeys.

## Default options provider

`HotkeysProvider` also sets default options for every hotkey hook. Options passed directly to a hook override the provider defaults.

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

function Root() {
  return (
    <HotkeysProvider
      defaultOptions={{
        hotkey: { preventDefault: true, timeout: 1500 },
        hotkeyRecorder: { onCancel: () => console.log('Recording cancelled') },
      }}
    >
      <App />
    </HotkeysProvider>
  )
}
```

## Next steps

- [Hotkeys Guide](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md#source-hotkeys-docs-framework-react-guides-hotkeys-md) - Deep dive into `useHotkey` options and patterns
- [Sequences Guide](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md) - Multi-key sequence handling
- [App Hotkeys Guide](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md) - Declaring, listing, and customizing every hotkey
- [Hotkey Recording Guide](./hotkeys-docs-framework-react-guides-hotkey-recording-md-893a8184.md#source-hotkeys-docs-framework-react-guides-hotkey-recording-md) - Recording chords and sequences in settings UIs
- [Key State Tracking Guide](./hotkeys-docs-framework-react-guides-key-state-tracking-md-f6c8e6ae.md#source-hotkeys-docs-framework-react-guides-key-state-tracking-md) - Real-time key state monitoring
- [Formatting & Display Guide](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#source-hotkeys-docs-framework-react-guides-formatting-display-md) - Platform-aware hotkey formatting
