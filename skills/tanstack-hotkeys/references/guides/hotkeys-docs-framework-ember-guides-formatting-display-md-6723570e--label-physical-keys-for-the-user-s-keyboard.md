# Formatting Display — Label physical keys for the user's keyboard

[Guide and prerequisites](./hotkeys-docs-framework-ember-guides-formatting-display-md-6723570e.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Label physical keys for the user's keyboard

A position, such as `[KeyQ]`, has a fallback label for a US keyboard: `Q`. On a French AZERTY keyboard, that key is labeled A. Labels from `useFormatForDisplay` follow the user's keyboard where the browser reports its layout:

```gts
import Component from '@glimmer/component'
import { useFormatForDisplay } from '@tanstack/ember-hotkeys'

export default class MoveUp extends Component {
  formatForDisplay = useFormatForDisplay()

  <template>
    {{! 'W' on QWERTY, 'Z' on AZERTY }}
    <kbd>{{this.formatForDisplay "[KeyW]"}}</kbd>
  </template>
}
```

> [!IMPORTANT]
> **Layout labels work only in Chromium browsers**, such as Chrome and Edge. Firefox and Safari don't report the keyboard layout, so labels there keep the fallback. For `[KeyQ]`, a French AZERTY user sees `A` in Chrome and `Q` in Firefox. In a cross-origin iframe, Chromium browsers also refuse unless the frame has `allow="keyboard-map"`.

- **The layout loads after the first label renders.** The first render shows the fallback label, and so does FastBoot HTML. The label updates when the layout arrives, and later labels have it at once.
- **Only positions change.** Hotkeys that follow characters, such as `Mod+Q`, already show the right key. Matching and recording never use the layout.
- **Each function from `useFormatForDisplay` reads the layout once**, after the render in which it first labels a position. The function has no owner, so it doesn't follow the layout after that. A label that renders later reads the layout again, and every label then updates.

`useKeyboardLayout(this)` returns the loaded layout through `value`, or `null`, for labels you draw yourself, such as an on-screen keyboard. It maps each code to the character the key types without modifiers, such as `KeyQ` to `a`. While its owner lives, the layout is also read again when the window regains focus, because browsers send no event when the user switches layouts. To keep every label current, call it in a component that stays rendered, such as the one your application template renders:

```gts
import Component from '@glimmer/component'
import { useKeyboardLayout } from '@tanstack/ember-hotkeys'

export default class AppShell extends Component {
  layout = useKeyboardLayout(this)

  <template>{{yield}}</template>
}
```

The layout comes from `navigator.keyboard.getLayoutMap()`. To never call it, set `keyboardLayout: false` in the default options of `createHotkeysScope`, and pass the scope to `useFormatForDisplay` and `useKeyboardLayout`:

```ts
hotkeys = createHotkeysScope({ keyboardLayout: false })
formatForDisplay = useFormatForDisplay(this.hotkeys)
```

### Supply your own layout

Pass the same kind of map as `layoutMap`, for a layout your app already knows, such as one the user picked in settings:

```ts
const layoutMap = new Map([['KeyQ', 'a']])

formatForDisplay('Mod+[KeyQ]', { platform: 'mac', layoutMap }) // '⌘ A'
formatForDisplay('Mod+Q', { platform: 'mac', layoutMap }) // '⌘ Q'
```

Any object with `get(code): string | undefined` works. A `layoutMap` you pass wins over the loaded layout.

Use `keyLabels` for your own labels, keyed by physical code or by key name:

```ts
formatForDisplay('Mod+[KeyQ]', {
  platform: 'mac', layoutMap, keyLabels: { KeyQ: 'Action' },
}) // '⌘ Action'
```

`keyLabels` wins over a layout entry, which wins over the fallback label. Layout entries get normal letter casing and key symbols, and missing or empty entries fall back. All of these options affect display only. `keyLabels` works anywhere, including in FastBoot.
