# Hotkey Hints

<a id="source-hotkeys-docs-framework-octane-guides-hotkey-hints-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `useHotkeyHint` returns `true` while the user holds modifiers that belong to a hotkey. It's an optional helper, and it doesn't register anything, so use it alongside `useHotkey`.

## Show a hint next to a button

```tsx
import {
  formatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/octane-hotkeys'

const saveHotkey = 'Mod+S'

function SaveButton() @{
  useHotkey(saveHotkey, save)
  const showHint = useHotkeyHint(saveHotkey)

  <button onClick={save}>
    Save{' '}
    @if (showHint) {
      <kbd>{formatForDisplay(saveHotkey)}</kbd>
    }
  </button>
}
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md#source-hotkeys-docs-framework-octane-guides-formatting-display-md) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.

To show a hint only while every modifier is held, pass `exact`:

```tsx
const showHint = useHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `useHotkeyHint`, so `Mod` resolves the same way.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```tsx
const showHint = useHotkeyHint(['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./hotkeys-docs-framework-octane-guides-app-hotkeys-md-ade4f49f.md#source-hotkeys-docs-framework-octane-guides-app-hotkeys-md) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```tsx
import {
  formatForDisplay,
  useAppHotkeys,
  useHotkeyHint,
} from '@tanstack/octane-hotkeys'
import type { AppHotkeyId } from '@tanstack/octane-hotkeys'

function Hint({ id }: { id: AppHotkeyId }) @{
  const appHotkey = useAppHotkeys()[id]
  const showHint = useHotkeyHint(appHotkey)

  @if (showHint && appHotkey.hotkey) {
    <kbd>{formatForDisplay(appHotkey.hotkey)}</kbd>
  }
}

function Toolbar() @{
  <button onClick={save}>
    Save <Hint id="doc.save" />
  </button>
}
```

## Hide hints for hotkeys that can't fire

`useHotkeyHint` only looks at held keys. It doesn't know whether the hotkey is enabled, its scope is active, or its target has focus. When a hotkey can be off, combine the hint with the same state:

```tsx
useHotkey(saveHotkey, save, { enabled: isDirty })
const showHint = useHotkeyHint(saveHotkey) && isDirty
```

## Check held modifiers without the hook

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options:

```ts
import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/octane-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held
```

[Held Key State Helpers](./hotkeys-docs-framework-octane-guides-held-key-state-helpers-md-8f82c6a9.md#source-hotkeys-docs-framework-octane-guides-held-key-state-helpers-md) covers the tracker and the other held-key hooks.

The [Kitchen Sink example](https://github.com/TanStack/hotkeys/tree/2172bfc6a4a50b4adb6f86c3f79b6eb3ae7a28b3/examples/octane/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
