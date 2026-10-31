# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md) · Release-matched documentation · `@tanstack/hotkeys@0.20.0`.

## Hotkey options

Pass options as named arguments:

```hbs
{{! Submit with Enter, even while focus is in a text field }}
{{useHotkey 'Enter' this.submit ignoreInputs=false}}
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey responds to key presses. See [Enable and disable hotkeys](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#hotkey-targets). |
| `preventDefault` | `true` | Stops the browser's own action, such as the Save dialog for `Mod+S`. `'always'` also stops it while the hotkey can't fire. |
| `stopPropagation` | `true` | Stops the key press from reaching other listeners |
| `ignoreInputs` | `'auto'` | Skips key presses that type in a text field or operate a focused control. See [Typing in inputs does not trigger shortcuts](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs before the keyboard handlers of elements inside the target. See [Hotkeys run after the page's own handlers](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of again on each automatic repeat while the key is held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | What happens when the same hotkey is already registered. See [Handle duplicate hotkeys](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#handle-duplicate-hotkeys). |
| `scope` | `'global'` | The scope the hotkey belongs to. See [Add defaults and scopes](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md). |
| `platform` | Detected | The platform that decides what `Mod` means: `'mac'`, `'windows'`, or `'linux'`. Useful in tests. |
| `meta` | None | A name, a description, and a group. See [Describe hotkeys with `meta`](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#describe-hotkeys-with-meta). |

The defaults suit most hotkeys. [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) explains why each one was chosen and when to change it. The [`EmberHotkeyCommonOptions` reference](https://github.com/TanStack/hotkeys/blob/5d9d8332ef4fa70cdcb00bb84f43b4a1ada9df02/docs/framework/ember/reference/type-aliases/EmberHotkeyCommonOptions.md) lists the types.

To change a default for several hotkeys, pass default options to `createHotkeysScope`, and use the helpers and modifiers it returns. Options passed to a helper override the defaults:

```gts
import Component from '@glimmer/component'
import { array } from '@ember/helper'
import { createHotkeysScope } from '@tanstack/ember-hotkeys'

export default class Editor extends Component {
  hotkeys = createHotkeysScope({ hotkey: { requireReset: true, timeout: 1500 } })
  scrollToTop = () => window.scrollTo({ top: 0 })

  <template>
    {{this.hotkeys.useHotkey (array 'G' 'G') this.scrollToTop}}
  </template>
}
```

Pass `this.hotkeys` to child components, such as `@hotkeys={{this.hotkeys}}`, so they share the same defaults. Without defaults, every hotkey uses the built-in defaults in the table. `createHotkeysScope` only sets defaults. It doesn't create a hotkey scope.

### Chord and sequence options

Most options apply to both kinds of hotkey. `requireReset` applies only to chords, and `timeout` only to sequences. Named arguments accept both, and each applies only to the matching kind, so `timeout` on a chord does nothing. In a `useHotkeys` array, each definition's `options` are typed by its `hotkey`, so TypeScript rejects options for the other kind:

```ts
shortcuts: Array<EmberHotkeyDefinition> = [
  { hotkey: 'Escape', callback: close, options: { requireReset: true } }, // OK
  { hotkey: ['G', 'G'], callback: scrollToTop, options: { timeout: 500 } }, // OK
  { hotkey: 'Escape', callback: close, options: { timeout: 500 } }, // Type error
]
```

Options that apply to many hotkeys at once, such as `createHotkeysScope` defaults, also apply each of these to the matching kind only. In the defaults example above, `requireReset` affects chords, and `timeout` affects sequences.
