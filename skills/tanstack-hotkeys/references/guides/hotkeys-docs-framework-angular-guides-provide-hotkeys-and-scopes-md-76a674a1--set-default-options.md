# Provide Hotkeys And Scopes — Set default options

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

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

- `hotkey` defaults apply to every `injectHotkey` and `injectHotkeys` below the provider. `requireReset` applies to chords, and `timeout` to sequences. Options passed to a function override the defaults. See [Hotkey options](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md).
- `hotkeyRecorder` defaults apply to every `injectHotkeyRecorder` below the provider. See [Custom Hotkey Recording](./hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md-580c3d9c.md#source-hotkeys-docs-framework-angular-guides-custom-hotkey-recording-md).

A `provideHotkeys` in a component's `providers` merges its defaults over its parent's, so a component can change the defaults for its part of your app.
