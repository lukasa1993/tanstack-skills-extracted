# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md) · Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

## Hotkey options

Pass options as the third argument:

```tsx
// Submit with Enter even while focused in a text input
useHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#handle-duplicate-hotkeys). |
| `scope` | Nearest provider's scope | The [scope](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) this hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#describe-hotkeys-with-meta). |

See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for why each default behaves the way it does, and [`UseHotkeyOptions`](https://github.com/TanStack/hotkeys/blob/fc48fc09f82cd285da5e0991948d604cec2a3263/docs/framework/octane/reference/type-aliases/UseHotkeyOptions.md) for full type definitions.

To change defaults across your app, pass `defaultOptions` to a root `HotkeysProvider`. Hook-level options always override provider defaults:

```tsx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'

function Root() @{
  <HotkeysProvider
    defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
  >
    <App />
  </HotkeysProvider>
}
```

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```tsx
useHotkey('Escape', close, { requireReset: true }) // OK
useHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
useHotkey('Escape', close, { timeout: 500 }) // Type error
```

When setting defaults across many hotkeys via `HotkeysProvider` or `useHotkeys` shared options, `requireReset` applies only to chords and `timeout` applies only to sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only options common to both kinds are accepted.
