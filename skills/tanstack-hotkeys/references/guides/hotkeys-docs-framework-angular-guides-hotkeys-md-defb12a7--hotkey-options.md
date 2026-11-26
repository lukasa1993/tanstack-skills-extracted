# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Hotkey options

Pass options as the third argument:

```ts
// Submit with Enter, even while focus is in a text field
injectHotkey('Enter', () => this.submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#handle-duplicate-hotkeys). |
| `scope` | The nearest provider's scope | The [scope](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) the hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#describe-hotkeys-with-meta). |

See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for why each default behaves the way it does, and the [`InjectHotkeyOptions` reference](https://github.com/TanStack/hotkeys/blob/fc48fc09f82cd285da5e0991948d604cec2a3263/docs/framework/angular/reference/type-aliases/InjectHotkeyOptions.md) for type definitions.

To change a default for every hotkey in your app, add `provideHotkeys` with `defaultOptions` to your application config. Options passed to `injectHotkey` override the provided defaults:

```ts
import { ApplicationConfig } from '@angular/core'
import { provideHotkeys } from '@tanstack/angular-hotkeys'

export const appConfig: ApplicationConfig = {
  providers: [
    provideHotkeys({
      defaultOptions: { hotkey: { requireReset: true, timeout: 1500 } },
    }),
  ],
}
```

The provider is optional. See [provideHotkeys & Scopes](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md#source-hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```ts
injectHotkey('Escape', close, { requireReset: true }) // OK
injectHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
injectHotkey('Escape', close, { timeout: 500 }) // Type error
```

When defaults apply to many hotkeys at once, `requireReset` affects only chords and `timeout` affects only sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only the options common to both kinds are accepted.
