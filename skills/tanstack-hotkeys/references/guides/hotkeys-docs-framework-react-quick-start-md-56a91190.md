# Quick Start

<a id="source-hotkeys-docs-framework-react-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.16.0`.

[Topic index](../framework-react.md) · [Source provenance](../SOURCES.md)

This guide adds keyboard shortcuts to a React app. If you haven't installed TanStack Hotkeys yet, see [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md).

## Register a hotkey

TanStack Hotkeys needs no special setup. To register a keyboard shortcut, call `useHotkey` in the component that owns the action:

```tsx
import { useHotkey } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

`Mod` is Command on macOS and Control on Windows and Linux, so `Mod+S` is the save shortcut each user already knows. The browser's Save dialog stays closed, and the shortcut still works while the user types in the textarea. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains these defaults.

That's all a hotkey needs. Providers, scopes, and the other features later in this guide are optional, so add them as your app grows.

## Register several hotkeys

When a component has more than one hotkey, register them together with `useHotkeys`:

```tsx
import { useHotkeys } from '@tanstack/react-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Z', callback: () => undo() },
    { hotkey: 'Mod+Shift+Z', callback: () => redo() },
  ])

  return <textarea />
}
```

`useHotkeys` takes an array, so the list can also come from data, and its length can change between renders.

## Sequences

Pass an array of chords to register a sequence, pressed one after another:

```tsx
useHotkey(['G', 'G'], () => scrollToTop())
```

Each step must follow the previous one within a second.

`useHotkeys` accepts chords and sequences in the same array:

```tsx
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Label a button or menu item with `formatForDisplay`. Format the same value you register, so the label always matches the binding:

```tsx
import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'
import type { HotkeyChord } from '@tanstack/react-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

function SaveButton() {
  useHotkey(saveHotkey, () => save())

  return (
    <button onClick={save}>
      Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
    </button>
  )
}
```

The label is `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` checks the string, so a typo in the binding is a type error. Use `Hotkey` for a value that can also be a sequence.

## Hotkeys follow your components

A hotkey is registered when the component that calls the hook mounts, and unregistered when that component unmounts. Put each hotkey in the component it belongs to, so it is active only while that component is mounted:

```tsx
function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Settings</button>
      {isOpen && <SettingsDialog onClose={() => setIsOpen(false)} />}
    </>
  )
}

function SettingsDialog({ onClose }: { onClose: () => void }) {
  // Registered only while the dialog is open
  useHotkey('Escape', onClose)

  return <div role="dialog">...</div>
}
```

For a condition that doesn't match a component, pass `enabled`:

```tsx
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

When a group of hotkeys turns on and off together, put them in a scope instead. See [Add providers and scopes](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#add-providers-and-scopes-optional).

## Element hotkeys

A hotkey's default `target` is `document`, so it works wherever focus is on the page. To limit it to one element, pass a ref as `target`:

```tsx
import { useRef } from 'react'
import { useHotkey } from '@tanstack/react-hotkeys'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // Fires only while the panel, or something inside it, has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      ...
    </div>
  )
}
```

The element must be focusable to receive key presses, so give it a `tabIndex` if it isn't a control.

## Add providers and scopes (optional)

So far, every hotkey uses the built-in defaults and belongs to the global scope, so it is active whenever its component is mounted. You don't need a provider for that.

Add `HotkeysProvider` at the root to set default options for every hotkey inside it, such as more time between sequence steps:

```tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'

function Root() {
  return (
    <HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
      <App />
    </HotkeysProvider>
  )
}
```

Add more providers deeper in your app to group hotkeys into scopes. Every hotkey inside a provider with a `scope` belongs to that scope. Make the scope `exclusive`, and while it is mounted, only its hotkeys work. Use one for dialogs and popups that should own the keyboard:

```tsx
import { HotkeysProvider, useHotkeys } from '@tanstack/react-hotkeys'

function ConfirmDialog(props: ConfirmDialogProps) {
  return (
    <HotkeysProvider scope="confirm-dialog" exclusive>
      <ConfirmDialogBody {...props} />
    </HotkeysProvider>
  )
}

function ConfirmDialogBody({ onConfirm, onCancel }: ConfirmDialogProps) {
  useHotkeys([
    { hotkey: 'Enter', callback: onConfirm },
    { hotkey: 'Escape', callback: onCancel },
  ])

  return <div role="dialog">...</div>
}
```

While the dialog is open, `Enter` and `Escape` confirm and cancel it, and every hotkey outside the dialog is suspended. When the dialog closes, they work again.

A hook uses the nearest provider above the component that calls it, so register the dialog's hotkeys in a child of its provider. [HotkeysProvider and Scopes](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md) covers nested scopes, precedence, and turning a scope off without unmounting it.

## Next steps

Learn more about the basics:

- [Hotkeys](./hotkeys-docs-framework-react-guides-hotkeys-md-88956014.md#source-hotkeys-docs-framework-react-guides-hotkeys-md): chords and sequences, options, and element hotkeys
- [Sequences](./hotkeys-docs-framework-react-guides-sequences-md-00eadae7.md#source-hotkeys-docs-framework-react-guides-sequences-md): Vim-style multi-key shortcuts
- [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#source-hotkeys-docs-framework-react-guides-formatting-display-md): labels and keycaps for every platform
- [Held Key State Helpers](./hotkeys-docs-framework-react-guides-held-key-state-helpers-md-0d45a2d9.md#source-hotkeys-docs-framework-react-guides-held-key-state-helpers-md): show which keys are held
- [Hotkey Hints](./hotkeys-docs-framework-react-guides-hotkey-hints-md-abc64c12.md#source-hotkeys-docs-framework-react-guides-hotkey-hints-md): show a button's shortcut while the user holds its modifiers
- [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md): inspect registered hotkeys, scopes, and held keys while you develop

As your app grows:

- [HotkeysProvider and Scopes](./hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md-bdb950e6.md#source-hotkeys-docs-framework-react-guides-hotkeys-provider-and-scopes-md): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [App Hotkeys](./hotkeys-docs-framework-react-guides-app-hotkeys-md-211e92b7.md#source-hotkeys-docs-framework-react-guides-app-hotkeys-md): declare hotkeys in one place and let users change them
- [Cheat Sheet UI Helpers](./hotkeys-docs-framework-react-guides-cheat-sheet-ui-helpers-md-5cace2b3.md#source-hotkeys-docs-framework-react-guides-cheat-sheet-ui-helpers-md): list your shortcuts in a help dialog
- [Custom Hotkey Recording](./hotkeys-docs-framework-react-guides-custom-hotkey-recording-md-376391c6.md#source-hotkeys-docs-framework-react-guides-custom-hotkey-recording-md): record the shortcut a user presses
- [Hotkey Manager](./hotkeys-docs-framework-react-guides-hotkey-manager-md-8041d892.md#source-hotkeys-docs-framework-react-guides-hotkey-manager-md): register and inspect hotkeys outside components
