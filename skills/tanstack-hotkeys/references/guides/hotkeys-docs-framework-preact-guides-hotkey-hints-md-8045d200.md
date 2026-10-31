# Hotkey Hints

<a id="source-hotkeys-docs-framework-preact-guides-hotkey-hints-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

[Topic index](../framework-preact.md) · [Source provenance](../SOURCES.md)

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `useHotkeyHint` returns `true` while the user holds modifiers that belong to a hotkey that can fire. It's an optional helper, and it doesn't register anything, so use it alongside `useHotkey`.

## Show a hint next to a button

```tsx
import {
  formatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/preact-hotkeys'

const saveHotkey = 'Mod+S'

function SaveButton() {
  useHotkey(saveHotkey, save)
  const showHint = useHotkeyHint(saveHotkey)

  return (
    <button onClick={save}>
      Save {showHint && <kbd>{formatForDisplay(saveHotkey)}</kbd>}
    </button>
  )
}
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./hotkeys-docs-framework-preact-guides-formatting-display-md-817c4c0d.md#source-hotkeys-docs-framework-preact-guides-formatting-display-md) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.
- The hotkey must be able to fire. A hint shows only while a registration of the hotkey is enabled and in an active [scope](./hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md-830bfdea.md#source-hotkeys-docs-framework-preact-guides-hotkeys-provider-and-scopes-md). A hotkey that nothing registers never shows a hint.
- Every registration of the hotkey counts, not only the one in your component. If two components register the same hotkey and only one is enabled, both show the hint.
- A hotkey bound to an element's `target` shows its hint only while focus is inside that element. A hotkey on `document` or `window` shows it wherever focus is.

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

Pass an [app hotkey](./hotkeys-docs-framework-preact-guides-app-hotkeys-md-426d55b2.md#source-hotkeys-docs-framework-preact-guides-app-hotkeys-md) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```tsx
import {
  formatForDisplay,
  useAppHotkeys,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/preact-hotkeys'
import type { AppHotkeyId } from '@tanstack/preact-hotkeys'

function Hint({ id }: { id: AppHotkeyId }) {
  const appHotkey = useAppHotkeys()[id]
  const showHint = useHotkeyHint(appHotkey)

  return showHint && appHotkey.hotkey ? (
    <kbd>{formatForDisplay(appHotkey.hotkey)}</kbd>
  ) : null
}

function Toolbar() {
  useHotkey(useAppHotkeys()['doc.save'], save)

  return (
    <button onClick={save}>
      Save <Hint id="doc.save" />
    </button>
  )
}
```

## Check held modifiers without the hook

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options, but it only looks at held keys. To also check that the hotkey can fire, call `hasActiveRegistration` on the hotkey manager:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/preact-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the hook
```

[Held Key State Helpers](./hotkeys-docs-framework-preact-guides-held-key-state-helpers-md-4ba7e38b.md#source-hotkeys-docs-framework-preact-guides-held-key-state-helpers-md) covers the tracker and the other held-key hooks.

The [Kitchen Sink example](https://github.com/TanStack/hotkeys/tree/5d9d8332ef4fa70cdcb00bb84f43b4a1ada9df02/examples/preact/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
