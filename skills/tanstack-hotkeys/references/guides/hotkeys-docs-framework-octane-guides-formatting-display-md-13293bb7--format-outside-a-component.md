# Formatting Display — Format outside a component

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format outside a component

`useFormatForDisplay` is a hook, so it can't run in a test or a plain module. Call `formatForDisplay` directly and pass `platform` yourself:

```ts
import { formatForDisplay } from '@tanstack/octane-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

`formatForDisplay` doesn't read `HotkeysProvider` and uses only the `layoutMap` you pass. To feed it the browser layout outside Octane, call `loadKeyboardLayout()` and read `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` on the Octane package so editor autocomplete nudges component code toward `useFormatForDisplay()`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.
