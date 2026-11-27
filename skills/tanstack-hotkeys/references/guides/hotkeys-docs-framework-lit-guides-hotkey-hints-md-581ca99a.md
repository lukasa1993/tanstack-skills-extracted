# Hotkey Hints

<a id="source-hotkeys-docs-framework-lit-guides-hotkey-hints-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.36.0`.

[Topic index](../framework-lit.md) · [Source provenance](../SOURCES.md)

Some apps hide shortcut badges until the user holds a modifier key, keeping buttons clean while still making shortcuts discoverable on demand.

`HotkeyHintController` exposes a `value` getter that returns `true` while the user holds modifiers belonging to an active hotkey. It's an optional display helper and doesn't register a shortcut itself, so pair it with `@hotkey` or `HotkeyController`.

## Show a hint next to a button

```ts
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import {
  FormatForDisplayController,
  HotkeyHintController,
  hotkey,
} from '@tanstack/lit-hotkeys'

const saveHotkey = 'Mod+S'

@customElement('save-button')
class SaveButton extends LitElement {
  private hint = new HotkeyHintController(this, saveHotkey)
  private formatForDisplay = new FormatForDisplayController(this)

  @hotkey(saveHotkey)
  save() {
    /* ... */
  }

  render() {
    return html`
      <button @click=${() => this.save()}>
        Save
        ${this.hint.value
          ? html`<kbd>${this.formatForDisplay.format(saveHotkey)}</kbd>`
          : ''}
      </button>
    `
  }
}
```

The controller requests an update only when the hint appears or disappears. Holding `Command` on macOS or `Control` elsewhere reveals `Save ⌘ S` or `Save Ctrl+S`. See [Formatting & Display](./hotkeys-docs-framework-lit-guides-formatting-display-md-6f8642f5.md#source-hotkeys-docs-framework-lit-guides-formatting-display-md) for formatting options.

## When a hint shows

- **Any matching modifier shows the hint.** For `Alt+Shift+[KeyK]`, holding `Alt`, `Shift`, or both shows it. Pass `{ exact: true }` to require every modifier instead:

```ts
private hint = new HotkeyHintController(this, 'Alt+Shift+[KeyK]', {
  exact: true,
}) // Requires Alt AND Shift
```

- **Extra modifiers hide it.** Holding `Control` + `Alt` shows hints only for shortcuts using both.
- **Releases and blur hide it.** Releasing all modifiers or leaving the window hides hints cleanly.
- **Non-modifier and `AltGr` keys.** Other held keys are ignored, and `AltGr` never triggers hints since it types characters.
- **Modifier-only requirement.** Unmodified shortcuts such as `Escape` or `G` never show hints.
- **Only active registrations count.** The hotkey must have at least one enabled registration in an active [scope](./hotkeys-docs-framework-lit-guides-hotkey-manager-md-506c8dcc.md#source-hotkeys-docs-framework-lit-guides-hotkey-manager-md). This checks across all mounted registrations, so if two elements register `Mod+S` and one is enabled, both hints appear.
- **Targets follow focus.** An element-targeted hotkey shows its hint only while focus is inside that element. `document` and `window` hotkeys show regardless of focus.
- **Custom platforms and reactive inputs.** If the hotkey overrides `platform`, pass the same `platform` to `HotkeyHintController`. Both the hotkey and the options can be getter functions that read reactive properties.

## Hints for sequences

Sequences reveal their hint while the user holds the modifiers of their first step:

```ts
private hint = new HotkeyHintController(this, ['Mod+K', 'Mod+C']) // true while Mod is held
```

## Hints for app hotkeys

Pass an [app hotkey](./hotkeys-docs-framework-lit-guides-app-hotkeys-md-6d116aa2.md#source-hotkeys-docs-framework-lit-guides-app-hotkeys-md) directly so hints stay synchronized even when users rebind shortcuts. Unassigned app hotkeys never show a hint. A small shared element keeps buttons tidy:

```ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
  AppHotkeysController,
  FormatForDisplayController,
  HotkeyHintController,
} from '@tanstack/lit-hotkeys'
import type { AppHotkeyId } from '@tanstack/lit-hotkeys'

@customElement('shortcut-hint')
class ShortcutHint extends LitElement {
  @property() hotkeyId!: AppHotkeyId
  private app = new AppHotkeysController(this)
  private hint = new HotkeyHintController(
    this,
    () => this.app.appHotkeys[this.hotkeyId],
  )
  private formatForDisplay = new FormatForDisplayController(this)

  render() {
    const { hotkey } = this.app.appHotkeys[this.hotkeyId]
    return this.hint.value && hotkey
      ? html`<kbd>${this.formatForDisplay.format(hotkey)}</kbd>`
      : ''
  }
}
```

```ts
import { hotkey } from '@tanstack/lit-hotkeys'
import { appHotkeys } from './app-hotkeys'

@customElement('doc-toolbar')
class DocToolbar extends LitElement {
  @hotkey(appHotkeys['doc.save'])
  save() {
    /* ... */
  }

  render() {
    return html`<button @click=${() => this.save()}>
      Save <shortcut-hint hotkeyId="doc.save"></shortcut-hint>
    </button>`
  }
}
```

## Check held modifiers without the controller

Outside Lit elements, such as canvas draw loops, combine `matchesHeldModifiers` with `getKeyStateTracker()` and `getHotkeyManager().hasActiveRegistration()`:

```ts
import {
  getHotkeyManager,
  getKeyStateTracker,
  matchesHeldModifiers,
} from '@tanstack/lit-hotkeys'

const tracker = getKeyStateTracker()

matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) // true while Mod is held

const showHint =
  matchesHeldModifiers('Mod+S', tracker.getHeldKeys()) &&
  getHotkeyManager().hasActiveRegistration('Mod+S') // Same check as the controller
```

See [Held Keys](./hotkeys-docs-framework-lit-guides-held-key-state-helpers-md-613e44c6.md#source-hotkeys-docs-framework-lit-guides-held-key-state-helpers-md) for more on `getKeyStateTracker`, and check the [Kitchen Sink example](https://github.com/TanStack/hotkeys/tree/3b22c105ab5b629a02e3e9e2d1719a9c2440833c/examples/lit/kitchen-sink) to see hints on live buttons.
