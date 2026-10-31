# Hotkey Hints

<a id="source-hotkeys-docs-framework-svelte-guides-hotkey-hints-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

[Topic index](../framework-svelte.md) · [Source provenance](../SOURCES.md)

Some apps show each button's shortcut only while the user holds a modifier, so the hints are there when the user reaches for the keyboard, and out of the way otherwise. `getHotkeyHint` returns an object whose `visible` getter is `true` while the user holds modifiers that belong to a hotkey that can fire. It's an optional helper, and it doesn't register anything, so use it alongside `createHotkey`.

## Show a hint next to a button

```svelte
<script lang="ts">
  import {
    createHotkey,
    formatForDisplay,
    getHotkeyHint,
  } from '@tanstack/svelte-hotkeys'

  const saveHotkey = 'Mod+S'

  createHotkey(saveHotkey, save)
  const hint = getHotkeyHint(saveHotkey)
</script>

<button onclick={save}>
  Save
  {#if hint.visible}<kbd>{formatForDisplay(saveHotkey)}</kbd>{/if}
</button>
```

While the user holds Command on macOS, or Control elsewhere, the button reads "Save ⌘ S" or "Save Ctrl+S". [Formatting & Display](./hotkeys-docs-framework-svelte-guides-formatting-display-md-505d4885.md#source-hotkeys-docs-framework-svelte-guides-formatting-display-md) covers labels and keycaps.

## When a hint shows

- Holding any of the hotkey's modifiers shows the hint. For `Alt+Shift+[KeyK]`, holding Alt, Shift, or both shows it.
- Holding a modifier the hotkey doesn't use hides the hint, so holding Control and Alt shows only the hints for hotkeys that use both.
- Releasing every modifier, or the window losing focus, hides the hint.
- Other held keys don't matter. AltGr never shows hints, because it types characters.
- A hotkey without modifiers, such as `Escape` or `G`, never shows a hint.
- The hotkey must be able to fire. A hint shows only while a registration of the hotkey is enabled and in an active [scope](./hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md-e8237f03.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-provider-and-scopes-md). A hotkey that nothing registers never shows a hint.
- Every registration of the hotkey counts, not only the one in your component. If two components register the same hotkey and only one is enabled, both show the hint.
- A hotkey bound to an element's `target` shows its hint only while focus is inside that element. A hotkey on `document` or `window` shows it wherever focus is.

To show a hint only while every modifier is held, pass `exact`:

```ts
const hint = getHotkeyHint('Alt+Shift+[KeyK]', { exact: true }) // Needs Alt and Shift
```

If the hotkey sets `platform`, pass the same `platform` to `getHotkeyHint`, so `Mod` resolves the same way. The hotkey and the options can also be getters.

## Hints for sequences

A sequence shows its hint while the user holds the modifiers of its first step:

```ts
const hint = getHotkeyHint(['Mod+K', 'Mod+C']) // hint.visible is true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./hotkeys-docs-framework-svelte-guides-app-hotkeys-md-bdf9b10d.md#source-hotkeys-docs-framework-svelte-guides-app-hotkeys-md) to show the user's current hotkey, including one they changed. An app hotkey with no hotkey assigned shows no hint. A small component keeps every button's hint the same:

```svelte
<!-- Hint.svelte -->
<script lang="ts">
  import {
    formatForDisplay,
    getAppHotkeys,
    getHotkeyHint,
  } from '@tanstack/svelte-hotkeys'
  import type { AppHotkeyId } from '@tanstack/svelte-hotkeys'

  let { id }: { id: AppHotkeyId } = $props()
  const appHotkeys = getAppHotkeys()
  const appHotkey = $derived(appHotkeys.current[id])
  const hint = getHotkeyHint(() => appHotkey)
</script>

{#if hint.visible && appHotkey.hotkey}
  <kbd>{formatForDisplay(appHotkey.hotkey)}</kbd>
{/if}
```

```svelte
<script lang="ts">
  import { createHotkey, getAppHotkeys } from '@tanstack/svelte-hotkeys'
  import Hint from './Hint.svelte'

  const appHotkeys = getAppHotkeys()
  createHotkey(() => appHotkeys.current['doc.save'], save)
</script>

<button onclick={save}>Save <Hint id="doc.save" /></button>
```

## Check held modifiers without the helper

To check outside a component, such as while drawing on a canvas, pass the held keys to `matchesHeldModifiers`. It takes the same options, but it only looks at held keys. To also check that the hotkey can fire, call `hasActiveRegistration` on the hotkey manager:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/svelte-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the helper
```

[Held Key State Helpers](./hotkeys-docs-framework-svelte-guides-held-key-state-helpers-md-878bc5cb.md#source-hotkeys-docs-framework-svelte-guides-held-key-state-helpers-md) covers the tracker and the other held-key functions.

The [Kitchen Sink example](https://github.com/TanStack/hotkeys/tree/5d9d8332ef4fa70cdcb00bb84f43b4a1ada9df02/examples/svelte/kitchen-sink) shows hints next to its navigation links and buttons while Alt or Option is held.
