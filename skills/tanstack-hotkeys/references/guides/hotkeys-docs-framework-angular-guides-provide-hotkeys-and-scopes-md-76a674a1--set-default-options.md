# Provide Hotkeys And Scopes — Set default options

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Set default options

Pass `defaultOptions` to change the defaults for everything below the provider:

```ts
import { provideHotkeys } from '@tanstack/angular-hotkeys'

bootstrapApplication(AppComponent, {
  providers: [
    provideHotkeys({
      defaultOptions: {
        hotkey: { requireReset: true, timeout: 1500 },
        hotkeyRecorder: { idleTimeoutMs: 2000 },
      },
    }),
  ],
})
```

- **`hotkey`.** Sets defaults for every `injectHotkey` and `injectHotkeys` in the provider (`requireReset` applies to chords, and `timeout` applies to sequences). Options passed to a hotkey override these defaults. See [Hotkey options](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md).
- **`hotkeyRecorder`.** Sets defaults for every `injectHotkeyRecorder` in the provider. See [Hotkey Recording](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#source-hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md).
- **`keyboardLayout: false`.** Stops labels from asking the browser for the user's keyboard layout. See [Label physical keys for the user's keyboard](./hotkeys-docs-framework-angular-guides-formatting-display-md-31421e77.md#source-hotkeys-docs-framework-angular-guides-formatting-display-md).

A `provideHotkeys` in a component's `providers` merges its defaults over its parent's, so a component can change the defaults for its part of your app.
