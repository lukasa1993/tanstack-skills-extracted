# Hotkey Hints

<a id="source-hotkeys-docs-framework-alpine-guides-hotkey-hints-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../framework-alpine.md) · [Source provenance](../SOURCES.md)

Some apps hide shortcut badges until the user holds a modifier key, keeping buttons clean while still making shortcuts discoverable on demand.

`createHotkeyHint` returns an object whose `value` is `true` while the user holds modifiers belonging to an active hotkey. It's an optional display helper and doesn't register a shortcut itself, so pair it with `createHotkey`.

## Show a hint next to a button

```ts
import Alpine from 'alpinejs'
import { createHotkeysScope } from '@tanstack/alpine-hotkeys'

const saveHotkey = 'Mod+S'

Alpine.data('saveButton', () => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()
  hotkeys.createHotkey(saveHotkey, () => save())
  const hint = hotkeys.createHotkeyHint(saveHotkey)

  return {
    get label() {
      return formatForDisplay(saveHotkey)
    },
    get showHint() {
      return hint.value
    },
    save,
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<button x-data="saveButton" @click="save()">
  Save <kbd x-show="showHint" x-text="label"></kbd>
</button>
```

Holding `Command` on macOS or `Control` elsewhere reveals `Save ⌘ S` or `Save Ctrl+S`. See [Formatting & Display](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md#source-hotkeys-docs-framework-alpine-guides-formatting-display-md) for formatting options.

## When a hint shows

- **Any matching modifier shows the hint.** For `Alt+Shift+[KeyK]`, holding `Alt`, `Shift`, or both shows it. Pass `{ exact: true }` to require every modifier instead:

```ts
const hint = hotkeys.createHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Requires Alt AND Shift
```

- **Extra modifiers hide it.** Holding `Control` + `Alt` shows hints only for shortcuts using both.
- **Releases and blur hide it.** Releasing all modifiers or leaving the window hides hints cleanly.
- **Non-modifier and `AltGr` keys.** Other held keys are ignored, and `AltGr` never triggers hints since it types characters.
- **Modifier-only requirement.** Unmodified shortcuts such as `Escape` or `G` never show hints.
- **Only active registrations count.** The hotkey must have at least one enabled registration in an active [scope](./hotkeys-docs-framework-alpine-guides-hotkey-manager-md-37a873d6.md#source-hotkeys-docs-framework-alpine-guides-hotkey-manager-md). This checks across all mounted registrations, so if two components register `Mod+S` and one is enabled, both hints appear.
- **Targets follow focus.** An element-targeted hotkey shows its hint only while focus is inside that element. `document` and `window` hotkeys show regardless of focus.
- **Custom platforms and getters.** If the hotkey overrides `platform`, pass the same `platform` to `createHotkeyHint`. Both the hotkey and the options can also be getters.

## Hints for sequences

Sequences reveal their hint while the user holds the modifiers of their first step:

```ts
const hint = hotkeys.createHotkeyHint(['Mod+K', 'Mod+C']) // hint.value is true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./hotkeys-docs-framework-alpine-guides-app-hotkeys-md-06d36fd9.md#source-hotkeys-docs-framework-alpine-guides-app-hotkeys-md) directly so hints stay synchronized even when users rebind shortcuts. Unassigned app hotkeys never show a hint. A small shared component keeps buttons tidy:

```ts
import type { AppHotkeyId } from '@tanstack/alpine-hotkeys'

Alpine.data('hint', (id: AppHotkeyId) => {
  const hotkeys = createHotkeysScope()
  const formatForDisplay = hotkeys.createFormatForDisplay()
  const appHotkeys = hotkeys.createAppHotkeys()
  const hint = hotkeys.createHotkeyHint(() => appHotkeys.value[id])

  return {
    get label() {
      const { hotkey } = appHotkeys.value[id]
      return hint.value && hotkey ? formatForDisplay(hotkey) : ''
    },
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```ts
Alpine.data('toolbar', () => {
  const hotkeys = createHotkeysScope()
  const appHotkeys = hotkeys.createAppHotkeys()
  hotkeys.createHotkey(
    () => appHotkeys.value['doc.save'],
    () => save(),
  )

  return {
    save,
    destroy() {
      hotkeys.destroy()
    },
  }
})
```

```html
<div x-data="toolbar">
  <button @click="save()">
    Save <kbd x-data="hint('doc.save')" x-show="label" x-text="label"></kbd>
  </button>
</div>
```

## Check held modifiers without the helper

Outside Alpine components, such as canvas draw loops, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/alpine-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the helper
```

See [Held Keys](./hotkeys-docs-framework-alpine-guides-held-key-state-helpers-md-45f4cbc6.md#source-hotkeys-docs-framework-alpine-guides-held-key-state-helpers-md) for more on `getKeyStateTracker`, and check the [Kitchen Sink example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/alpine/kitchen-sink) to see hints on live buttons.
