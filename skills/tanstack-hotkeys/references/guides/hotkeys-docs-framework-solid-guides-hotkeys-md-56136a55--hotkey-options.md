# Hotkeys — Hotkey options

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Hotkey options

Pass options as the third argument:

```tsx
// Submit with Enter even while focused in a text input
createHotkey('Enter', () => submit(), { ignoreInputs: false })
```

| Option | Default | Description |
| --- | --- | --- |
| `enabled` | `true` | Whether the hotkey fires. See [Enable and disable hotkeys](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#enable-and-disable-hotkeys). |
| `target` | `document` | Where the hotkey listens. See [Hotkey targets](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#hotkey-targets). |
| `preventDefault` | `true` | Prevents the browser's default action. `'always'` keeps blocking even while disabled or suspended. |
| `stopPropagation` | `true` | Stops the event from reaching outer listeners |
| `ignoreInputs` | `'auto'` | Skips keys in text fields and interactive controls. See [Typing in inputs](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `ignoreDefaultPrevented` | `false` | Skips events already prevented by another listener, such as a UI library overlay. See [Component libraries](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `eventType` | `'keydown'` | Fires on `'keydown'` or `'keyup'` |
| `capture` | `false` | Runs in the capture phase before widget handlers inside `target`. See [Event phase](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md). |
| `requireReset` | `false` | Chords only. Fires once per press instead of repeating while held. |
| `timeout` | `1000` | Sequences only. Milliseconds allowed between steps. |
| `conflictBehavior` | `'warn'` | How duplicate registrations are handled. See [Handle duplicate hotkeys](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#handle-duplicate-hotkeys). |
| `scope` | Nearest provider's scope | The [scope](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) this hotkey belongs to |
| `platform` | Detected | Override `'mac'`, `'windows'`, or `'linux'` for `Mod` resolution. Useful in tests. |
| `meta` | None | Display metadata (`name`, `description`, `group`). See [Describe hotkeys with `meta`](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#describe-hotkeys-with-meta). |

See [Sensible Defaults](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md#source-hotkeys-docs-guides-sensible-defaults-md) for why each default behaves the way it does, and [`CreateHotkeyOptions`](https://github.com/TanStack/hotkeys/blob/a3fc3ae3a058631dfe821a04edf4cf0cce49fb0a/docs/framework/solid/reference/type-aliases/CreateHotkeyOptions.md) for full type definitions.

To change defaults across your app, pass `defaultOptions` to a root `HotkeysProvider`. Options passed to a primitive always override provider defaults:

```tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'

function Root() {
  return (
    <HotkeysProvider
      defaultOptions={{ hotkey: { requireReset: true, timeout: 1500 } }}
    >
      <App />
    </HotkeysProvider>
  )
}
```

The provider is optional. See [HotkeysProvider & Scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md) for nested overrides and scope management.

### Chord and sequence options

`requireReset` applies only to chords, and `timeout` applies only to sequences. TypeScript enforces this per hotkey:

```tsx
createHotkey('Escape', close, { requireReset: true }) // OK
createHotkey(['G', 'G'], scrollToTop, { timeout: 500 }) // OK
createHotkey('Escape', close, { timeout: 500 }) // Type error
```

When setting defaults across many hotkeys via `HotkeysProvider` or `createHotkeys` shared options, `requireReset` applies only to chords and `timeout` applies only to sequences. If a hotkey's kind isn't known until runtime, such as a `Hotkey` loaded from user settings, only options common to both kinds are accepted.
