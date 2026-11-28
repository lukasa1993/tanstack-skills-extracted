# Formatting Display — Format outside a component

[Guide and prerequisites](./hotkeys-docs-framework-alpine-guides-formatting-display-md-c1379339.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format outside a component

`createFormatForDisplay` needs an owner from `createHotkeysScope`. Some code that builds labels has none, such as a helper function, a test, or a plain module. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/alpine-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from `createFormatForDisplay`. It doesn't read an owner's default options, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

The export is marked deprecated so that your editor points component code to `createFormatForDisplay`. Outside a component, it is the function to use.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.
