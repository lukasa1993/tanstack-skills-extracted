# Held Key State Helpers

<a id="source-hotkeys-docs-framework-octane-guides-held-key-state-helpers-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

These hooks track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkeys-docs-framework-octane-guides-hotkey-hints-md-9965291c.md#source-hotkeys-docs-framework-octane-guides-hotkey-hints-md).

## Show which keys are held

`useHeldKeys()` returns currently held keys in press order, such as `['Control', 'Shift', 'A']`:

```tsx
import { useHeldKeys } from '@tanstack/octane-hotkeys'

function KeyDisplay() @{
  const heldKeys = useHeldKeys()

  <div>{heldKeys.length > 0 ? `Held: ${heldKeys.join(' + ')}` : 'No keys held'}</div>
}
```

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to `formatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

## Check whether a key is held

`useKeyHold(key)` returns a boolean for one key. The component updates only when that key is pressed or released:

```tsx
import { useKeyHold } from '@tanstack/octane-hotkeys'

function FileItem({ file }: { file: File }) @{
  const isShiftHeld = useKeyHold('Shift')

  <div>
    <span>{file.name}</span>
    @if (isShiftHeld) {
      <button onClick={() => permanentlyDelete(file)}>Delete permanently</button>
    } @else {
      <button onClick={() => moveToTrash(file)}>Move to trash</button>
    }
  </div>
}
```

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

## Tell left and right modifiers apart

`useHeldKeyCodes()` maps each held key name to its physical `event.code`:

```tsx
import { useHeldKeyCodes } from '@tanstack/octane-hotkeys'

function ModifierSides() @{
  const heldCodes = useHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }

  @if (heldCodes.Shift === 'ShiftRight') {
    <p>Right Shift is held</p>
  }
}
```

## Read held keys in an event handler

To read the latest held keys in an event handler without updating the component, use the shared tracker from `getKeyStateTracker()`:

```tsx
import { getKeyStateTracker } from '@tanstack/octane-hotkeys'

function Canvas() @{
  const tracker = getKeyStateTracker()

  const onClick = () => {
    if (tracker.isKeyHeld('Space')) startPanning()
    else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }

  <canvas onClick={onClick} />
}
```

- Call `getKeyStateTracker()` during render or setup so it starts listening *before* the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker on unmount because all hooks share the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Note that browsers also set `ctrlKey` during trackpad pinch gestures.

Held keys reset automatically on window blur, tab switch, or macOS `Command` release so keys never stay stuck. See [Held keys reset when the window loses focus](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. See [Held keys reset when the window loses focus](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the cases the tracker handles.

See the [useHeldKeys example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/octane/useHeldKeys) and [useKeyHold example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/octane/useKeyHold).
