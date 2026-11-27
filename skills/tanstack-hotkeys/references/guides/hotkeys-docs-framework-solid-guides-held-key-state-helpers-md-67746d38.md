# Held Key State Helpers

<a id="source-hotkeys-docs-framework-solid-guides-held-key-state-helpers-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

These primitives track which keys the user is currently holding down. They're optional UI helpers for displaying live key indicators or swapping button labels while `Shift` is held. To reveal shortcut hints when a modifier is held, see [Hotkey Hints](./hotkeys-docs-framework-solid-guides-hotkey-hints-md-49dc3efa.md#source-hotkeys-docs-framework-solid-guides-hotkey-hints-md).

Each primitive returns an accessor, so call it to read the current value.

## Show which keys are held

`createHeldKeys` returns the held keys in press order, such as `['Control', 'Shift', 'A']`:

```tsx
import { createHeldKeys } from '@tanstack/solid-hotkeys'

function KeyDisplay() {
  const heldKeys = createHeldKeys()

  return (
    <div>
      {heldKeys().length > 0 ? `Held: ${heldKeys().join(' + ')}` : 'No keys held'}
    </div>
  )
}
```

To format held keys consistently (`Shift` to `⇧` on macOS, `Escape` to `Esc`), pass `{ key }` to the function from `createFormatForDisplay`. Wrapping in `{ key }` accepts raw browser key names outside the strict `Key` type.

## Check whether a key is held

`createKeyHold` returns whether one key is held. It updates only when that key is pressed or released, and accepts an accessor for a key that changes:

```tsx
import { Show } from 'solid-js'
import { createKeyHold } from '@tanstack/solid-hotkeys'

function FileItem(props: { file: File }) {
  const isShiftHeld = createKeyHold('Shift')

  return (
    <div>
      <span>{props.file.name}</span>
      <Show
        when={isShiftHeld()}
        fallback={<button onClick={() => moveToTrash(props.file)}>Move to trash</button>}
      >
        <button onClick={() => permanentlyDelete(props.file)}>Delete permanently</button>
      </Show>
    </div>
  )
}
```

Letters match case-insensitively (`'a'` and `'A'` are identical), while named keys are case-sensitive (`'Shift'`, `'Escape'`).

## Tell left and right modifiers apart

`createHeldKeyCodes` maps each held key name to its physical `event.code`:

```tsx
import { Show } from 'solid-js'
import { createHeldKeyCodes } from '@tanstack/solid-hotkeys'

function ModifierSides() {
  const heldCodes = createHeldKeyCodes() // e.g. { Shift: 'ShiftLeft', Control: 'ControlRight' }

  return (
    <Show when={heldCodes().Shift === 'ShiftRight'}>
      <p>Right Shift is held</p>
    </Show>
  )
}
```

## Read held keys in an event handler

To inspect held keys inside a click or canvas handler without tracking them, read the shared tracker from `getKeyStateTracker()`:

```tsx
import { getKeyStateTracker } from '@tanstack/solid-hotkeys'

function Canvas() {
  const tracker = getKeyStateTracker()

  const onClick = () => {
    if (tracker.isKeyHeld('Space')) startPanning()
    else if (tracker.isAnyKeyHeld(['Shift', 'Control'])) addToSelection()
    else select()
  }

  return <canvas onClick={onClick} />
}
```

- Call `getKeyStateTracker()` when the component is created so it starts listening *before* the user holds any keys.
- The tracker also exposes `getHeldKeys()` and `areAllKeysHeld(keys)`. Never destroy the shared tracker when a component unmounts, because every primitive shares the same instance.
- For mouse or wheel handlers, `event.shiftKey`, `altKey`, `metaKey`, and `ctrlKey` already exist on the event. Browsers also set `ctrlKey` during trackpad pinch gestures.

Held keys reset automatically on window blur, tab switch, or macOS `Command` release so keys never stay stuck. See [Held keys reset when the window loses focus](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md).

Held keys clear when the window loses focus, so a key released after switching apps doesn't stay held. See [Held keys reset when the window loses focus](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for the cases the tracker handles.

See the [createHeldKeys example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/solid/createHeldKeys) and [createKeyHold example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/solid/createKeyHold).
