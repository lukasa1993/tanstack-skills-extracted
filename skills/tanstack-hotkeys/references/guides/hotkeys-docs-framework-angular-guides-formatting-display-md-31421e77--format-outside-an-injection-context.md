# Formatting Display — Format outside an injection context

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Format outside an injection context

`injectFormatForDisplay` calls `inject`, so it needs an injection context, such as a field initializer or a constructor. Some code that builds labels has none, such as code at the top level of a module, or a test without `TestBed`. There, call the plain `formatForDisplay` function and pass the platform yourself:

```ts
import { formatForDisplay } from '@tanstack/angular-hotkeys'

formatForDisplay('Mod+S', { platform }) // '⌘ S' when platform is 'mac'
```

The plain function takes the same options as the function from `injectFormatForDisplay`. It doesn't read the provider, and it uses only the `layoutMap` you pass. Without a `platform`, it detects one in the browser and uses `'linux'` on a server. To give it the user's layout, call `loadKeyboardLayout()` in the browser, and read the layout from `getKeyboardLayoutStore()`.

> [!NOTE]
> `formatForDisplay` is marked `@deprecated` so editor autocomplete nudges component code toward `injectFormatForDisplay`. Outside components, calling it directly is expected.

For `aria-keyshortcuts` outside a component, call `formatForAria` directly with `platform` and an optional `layoutMap`. For example, `formatForAria('Mod+S', { platform: 'mac' })` returns `'Meta+S'`. Like `formatForDisplay`, the plain export is marked `@deprecated`, so editors point component code to the adapter's formatter.
