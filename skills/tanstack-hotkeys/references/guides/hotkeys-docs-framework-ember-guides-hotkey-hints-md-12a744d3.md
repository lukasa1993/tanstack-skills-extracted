# Hotkey Hints

<a id="source-hotkeys-docs-framework-ember-guides-hotkey-hints-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../framework-ember.md) · [Source provenance](../SOURCES.md)

Some apps hide shortcut badges until the user holds a modifier key, keeping buttons clean while still making shortcuts discoverable on demand.

`useHotkeyHint` returns an object whose tracked `value` is `true` while the user holds modifiers belonging to an active hotkey. It's an optional display helper and doesn't register a shortcut itself, so pair it with the `useHotkey` helper.

## Show a hint next to a button

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import {
  useFormatForDisplay,
  useHotkey,
  useHotkeyHint,
} from '@tanstack/ember-hotkeys'

const saveHotkey = 'Mod+S'

export default class SaveButton extends Component {
  formatForDisplay = useFormatForDisplay()
  hint = useHotkeyHint(this, saveHotkey)
  save = () => {
    /* ... */
  }

  <template>
    {{useHotkey saveHotkey this.save}}
    <button type='button' {{on 'click' this.save}}>
      Save {{#if this.hint.value}}<kbd>{{this.formatForDisplay saveHotkey}}</kbd>{{/if}}
    </button>
  </template>
}
```

Holding `Command` on macOS or `Control` elsewhere reveals `Save ⌘ S` or `Save Ctrl+S`. See [Formatting & Display](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md#source-hotkeys-docs-framework-ember-guides-formatting-display-md) for formatting options.

## When a hint shows

- **Any matching modifier shows the hint.** For `Alt+Shift+[KeyK]`, holding `Alt`, `Shift`, or both shows it. Pass `{ exact: true }` to require every modifier instead:

```ts
hint = useHotkeyHint(this, 'Alt+Shift+[KeyK]', { exact: true }) // Requires Alt AND Shift
```

- **Extra modifiers hide it.** Holding `Control` + `Alt` shows hints only for shortcuts using both.
- **Releases and blur hide it.** Releasing all modifiers or leaving the window hides hints cleanly.
- **Non-modifier and `AltGr` keys.** Other held keys are ignored, and `AltGr` never triggers hints since it types characters.
- **Modifier-only requirement.** Unmodified shortcuts such as `Escape` or `G` never show hints.
- **Only active registrations count.** The hotkey must have at least one enabled registration in an active [scope](./hotkeys-docs-framework-ember-guides-hotkey-manager-md-124cc37b.md#source-hotkeys-docs-framework-ember-guides-hotkey-manager-md). This checks across all mounted registrations, so if two components register `Mod+S` and one is enabled, both hints appear.
- **Targets follow focus.** An element-targeted hotkey shows its hint only while focus is inside that element. `document` and `window` hotkeys show regardless of focus.
- **Custom platforms and getters.** If the hotkey overrides `platform`, pass the same `platform` to `useHotkeyHint`. Both the hotkey and the options can also be getters.

## Hints for sequences

Sequences reveal their hint while the user holds the modifiers of their first step:

```ts
hint = useHotkeyHint(this, ['Mod+K', 'Mod+C']) // hint.value is true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./hotkeys-docs-framework-ember-guides-app-hotkeys-md-c66d9482.md#source-hotkeys-docs-framework-ember-guides-app-hotkeys-md) directly so hints stay synchronized even when users rebind shortcuts. Unassigned app hotkeys never show a hint. A small shared component keeps buttons tidy:

```gts
import Component from '@glimmer/component'
import {
  useAppHotkeys,
  useFormatForDisplay,
  useHotkeyHint,
} from '@tanstack/ember-hotkeys'
import type { AppHotkeyId } from '@tanstack/ember-hotkeys'

export default class Hint extends Component<{ Args: { id: AppHotkeyId } }> {
  formatForDisplay = useFormatForDisplay()
  appHotkeys = useAppHotkeys(this)
  hint = useHotkeyHint(this, () => this.appHotkeys.value[this.args.id])

  get label() {
    const { hotkey } = this.appHotkeys.value[this.args.id]
    return this.hint.value && hotkey ? this.formatForDisplay(hotkey) : null
  }

  <template>
    {{#if this.label}}<kbd>{{this.label}}</kbd>{{/if}}
  </template>
}
```

```gts
import Component from '@glimmer/component'
import { on } from '@ember/modifier'
import { useAppHotkeys, useHotkey } from '@tanstack/ember-hotkeys'
import Hint from './hint'

export default class Toolbar extends Component {
  appHotkeys = useAppHotkeys(this)
  save = () => {
    /* ... */
  }

  get saveHotkey() {
    return this.appHotkeys.value['doc.save']
  }

  <template>
    {{useHotkey this.saveHotkey this.save}}
    <button type='button' {{on 'click' this.save}}>Save <Hint @id='doc.save' /></button>
  </template>
}
```

## Check held modifiers without the utility

Outside Ember components, such as canvas draw loops, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/ember-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the utility
```

See [Held Keys](./hotkeys-docs-framework-ember-guides-held-key-state-helpers-md-100a9cec.md#source-hotkeys-docs-framework-ember-guides-held-key-state-helpers-md) for more on `getKeyStateTracker`, and check the [Kitchen Sink example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/ember/kitchen-sink) to see hints on live buttons.
