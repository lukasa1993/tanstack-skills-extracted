# Quick Start

<a id="source-hotkeys-docs-framework-preact-quick-start-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../framework-preact.md) · [Source provenance](../SOURCES.md)

This guide adds keyboard shortcuts to a Preact app. If you haven't installed TanStack Hotkeys yet, see [Installation](./hotkeys-docs-installation-md-bb05b3dc.md#source-hotkeys-docs-installation-md).

## Register a hotkey

TanStack Hotkeys needs no setup or provider to start. Call `useHotkey` in the component that owns the action:

```tsx
import { useHotkey } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkey('Mod+S', () => saveDocument())

  return <textarea />
}
```

`Mod` resolves to Command on macOS and Control on Windows and Linux. Out of the box, the browser's Save dialog stays closed, and `Mod+S` still fires while typing inside the `<textarea>`. See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) to learn how every default works.

Providers, scopes, and the rest of the features below are completely optional. Add them only as your app needs them.

## Register several hotkeys

When a component needs multiple shortcuts, register them together with `useHotkeys`:

```tsx
import { useHotkeys } from '@tanstack/preact-hotkeys'

function Editor() {
  useHotkeys([
    { hotkey: 'Mod+S', callback: () => save() },
    { hotkey: 'Mod+Enter', callback: () => publish() },
    { hotkey: 'Mod+D', callback: () => duplicate() },
  ])

  return <textarea />
}
```

Because `useHotkeys` takes an array, the list can come from dynamic data and change length between renders, unlike calling `useHotkey` in a loop.

## Sequences

Pass an array of chords to register a multi-step sequence, pressed one after another:

```tsx
useHotkey(['G', 'G'], () => scrollToTop())
```

By default, each step must follow the previous one within 1 second. `useHotkeys` accepts chords and sequences in the same array:

```tsx
useHotkeys([
  { hotkey: 'Mod+K', callback: () => openSearch() },
  { hotkey: ['G', 'H'], callback: () => goHome() },
  { hotkey: ['G', 'S'], callback: () => goToSettings() },
])
```

## Show the shortcut

Format a shortcut for buttons, menus, or tooltips with `useFormatForDisplay`. Passing the same binding you register guarantees the label always stays in sync:

```tsx
import { useFormatForDisplay, useHotkey } from '@tanstack/preact-hotkeys'
import type { HotkeyChord } from '@tanstack/preact-hotkeys'

const saveHotkey: HotkeyChord = 'Mod+S'

function SaveButton() {
  useHotkey(saveHotkey, () => save())
  const formatForDisplay = useFormatForDisplay()

  return (
    <button onClick={save}>
      Save <kbd>{formatForDisplay(saveHotkey)}</kbd>
    </button>
  )
}
```

This renders `⌘ S` on macOS and `Ctrl+S` on Windows and Linux. `HotkeyChord` type-checks the string so typos fail at compile time. Use `Hotkey` if a value can also be a sequence.

In server-rendered apps like Fresh or Astro, pass the request's platform to `HotkeysProvider` so server HTML matches the client without hydration errors. See [SSR & Hydration](./hotkeys-docs-framework-preact-guides-ssr-md-41b38694.md#source-hotkeys-docs-framework-preact-guides-ssr-md).

## Hotkeys follow your components

Hotkeys register when the calling component mounts and unregister when it unmounts. Put each shortcut in the component it belongs to so it's only active while rendered:

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
  // Active only while the dialog is open
  useHotkey('Escape', onClose)

  return <div role="dialog">...</div>
}
```

For conditions independent of mounting, pass `enabled`:

```tsx
useHotkey('Mod+S', () => save(), { enabled: hasUnsavedChanges })
```

When a whole group of shortcuts should toggle together, use a scope instead. See [Add providers and scopes](./hotkeys-docs-framework-preact-quick-start-md-9cac7afa.md#add-providers-and-scopes-optional).

## Element hotkeys

Hotkeys listen on `document` by default. To restrict a shortcut to a single element, pass a ref as `target`:

```tsx
import { useRef } from 'preact/hooks'
import { useHotkey } from '@tanstack/preact-hotkeys'

function Panel() {
  const panelRef = useRef<HTMLDivElement>(null)

  // Fires only while the panel (or something inside it) has focus
  useHotkey('Escape', () => closePanel(), { target: panelRef })

  return (
    <div ref={panelRef} tabIndex={0}>
      ...
    </div>
  )
}
```

Element hotkeys only fire while the element or a descendant has focus. Add `tabIndex={0}` if the container isn't focusable.

`useRef` works when the element renders with the component. If the target mounts later, such as inside a conditionally rendered child, store it in `useState` via a callback ref instead:

```tsx
import { useState } from 'preact/hooks'

function Sidebar() {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null)

  useHotkey('Escape', () => closePanel(), { target: panel })

  return <CollapsiblePanel panelRef={setPanel} />
}
```

See [Elements that mount later](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md) for details.

## Add providers and scopes (optional)

Without a provider, hotkeys use the built-in defaults and belong to the `'global'` scope.

To change default options across your app, add `HotkeysProvider` at the root:

```tsx
import { HotkeysProvider } from '@tanstack/preact-hotkeys'

function Root() {
  return (
    <HotkeysProvider defaultOptions={{ hotkey: { timeout: 1500 } }}>
      <App />
    </HotkeysProvider>
  )
}
```

Nest `HotkeysProvider` with a `scope` deeper in your tree to group shortcuts together. Marking a scope `exclusive` suspends every other scope while it's mounted, which works well for modals and confirmation dialogs:

```tsx
import { HotkeysProvider, useHotkeys } from '@tanstack/preact-hotkeys'

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

While the dialog is open, `Enter` and `Escape` belong exclusively to it, and background shortcuts pause until it closes.

> [!NOTE]
> Hooks read the nearest provider *above* the component calling them, so render the dialog's hotkeys inside a child of its `HotkeysProvider`.

See [HotkeysProvider & Scopes](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md) for nested scope precedence and toggling scopes via `enabled`.

## Next steps

Core guides:

- [Hotkeys](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md): chords and sequences, options, and element hotkeys
- [Sequences](./hotkeys-docs-framework-preact-guides-sequences-md-71b8fd79.md#source-hotkeys-docs-framework-preact-guides-sequences-md): Vim-style multi-key shortcuts
- [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md): what hotkeys do without options, and keyboard layouts
- [Formatting & Display](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md#source-hotkeys-docs-framework-preact-guides-formatting-display-md): labels and keycaps for every platform
- [HotkeysProvider & Scopes](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md): set default options, and turn groups of hotkeys on and off with dialogs, panes, and tabs
- [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md): inspect registered hotkeys, scopes, and held keys while you develop

App Hotkeys & UI:

- [App Hotkeys](./hotkeys-docs-framework-preact-guides-app-hotkeys-md-426d55b2.md#source-hotkeys-docs-framework-preact-guides-app-hotkeys-md): declare hotkeys in one place and let users change them
- [Hotkey Recording](./hotkeys-docs-framework-preact-guides-custom-hotkey-recording-md-816282c2.md#source-hotkeys-docs-framework-preact-guides-custom-hotkey-recording-md): record the shortcut a user presses
- [Cheat Sheets](./hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md-0544b194.md#source-hotkeys-docs-framework-preact-guides-cheat-sheet-ui-helpers-md): list your shortcuts in a help dialog
- [Hotkey Hints](./hotkeys-docs-framework-preact-guides-hotkey-hints-md-8045d200.md#source-hotkeys-docs-framework-preact-guides-hotkey-hints-md): show a button's shortcut while the user holds its modifiers
- [Held Keys](./hotkeys-docs-framework-preact-guides-held-key-state-helpers-md-4ba7e38b.md#source-hotkeys-docs-framework-preact-guides-held-key-state-helpers-md): show which keys are held

Advanced & Integration:

- [SSR & Hydration](./hotkeys-docs-framework-preact-guides-ssr-md-41b38694.md#source-hotkeys-docs-framework-preact-guides-ssr-md): server-render platform labels and pass app hotkeys from Server Components
- [Keyboard Layouts](./hotkeys-docs-framework-preact-guides-keyboard-layouts-md-023c2fea.md#source-hotkeys-docs-framework-preact-guides-keyboard-layouts-md): type-check keys from international layouts
- [Testing](./hotkeys-docs-framework-preact-guides-testing-md-81c90c35.md#source-hotkeys-docs-framework-preact-guides-testing-md): reset singleton state and fix the target platform in unit tests
- [Hotkey Manager](./hotkeys-docs-framework-preact-guides-hotkey-manager-md-60f997b1.md#source-hotkeys-docs-framework-preact-guides-hotkey-manager-md): register and inspect hotkeys outside components
