# Hotkey Manager

<a id="source-hotkeys-docs-framework-octane-guides-hotkey-manager-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

[Topic index](../framework-octane.md) · [Source provenance](../SOURCES.md)

This is an advanced guide. Inside Octane components, `useHotkey` and `useHotkeys` handle registration, cleanup, provider defaults, scopes, and fresh callbacks automatically. Use `HotkeyManager` directly only outside Octane components, such as inside third-party chart or canvas wrappers.

All hotkeys on a page share a single `HotkeyManager` instance that owns the DOM event listeners, matches key presses, tracks sequence progress, and evaluates scopes. Access it with `getHotkeyManager()`:

```ts
import { getHotkeyManager } from '@tanstack/octane-hotkeys'

const manager = getHotkeyManager()
```

## Register a hotkey

`manager.register` accepts the same hotkeys and options as `useHotkey` and returns a registration handle:

```ts
const handle = manager.register('Mod+K', () => openCommandPalette())

handle.setOptions({ enabled: false }) // Merges updated options
handle.callback = () => openSearch() // Updates callback in place
handle.unregister() // Removes the registration
```

Keep a few differences from `useHotkey` in mind:

- **Manual cleanup.** Registrations stay active until `handle.unregister()` is called.
- **No Octane context.** Provider `defaultOptions` and provider scopes don't apply. Registrations use the built-in defaults and `'global'` scope unless a `scope` is passed.
- **Element targets only.** Pass a DOM element, `document`, or `window` (not an Octane ref). A `null` target, like an empty `querySelector`, returns a no-op handle and doesn't wait for the element, so call `register` again once it exists. An omitted or `undefined` target listens on `document`.
- **SSR safe.** During server rendering, `register` returns a no-op handle.

For example, wiring shortcuts inside a vanilla chart plugin:

```ts
import { getHotkeyManager } from '@tanstack/octane-hotkeys'

export function attachChartHotkeys(chart: Chart, element: HTMLElement) {
  const manager = getHotkeyManager()
  const handles = [
    manager.register('I', () => chart.zoomIn(), { target: element }),
    manager.register('O', () => chart.zoomOut(), { target: element }),
  ]

  return () => handles.forEach((handle) => handle.unregister())
}
```

## Read registrations

Inside components, subscribe to registrations with `useHotkeyRegistrations` (see [List the hotkeys on screen](./hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md-3e802195.md#source-hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md)). Outside Octane, query the manager directly:

```ts
manager.getRegistrationCount() // Total registered hotkeys
manager.isRegistered('Mod+S') // Whether any registration matches
manager.isRegistered('Escape', panelElement) // Whether one matches on that target
```

`isRegistered` uses canonical matching just like [duplicate detection](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#source-hotkeys-docs-framework-octane-guides-hotkeys-md), so `'Meta+S'` matches a `'Mod+S'` registration on macOS.

`manager.registrations` reads and subscribes like a [TanStack Store](https://tanstack.com/store) holding a `Map` of registrations by ID:

```ts
const subscription = manager.registrations.subscribe((registrations) => {
  console.log(`${registrations.size} hotkeys registered`)
})

subscription.unsubscribe()
```

Because this store updates whenever a hotkey fires or a sequence step advances, keep subscribers lightweight. Raw registrations include `callback`. For the callback-free shape returned by `useHotkeyRegistrations`, pass a registration to `toHotkeyRegistrationView`.

## Activate a scope

Inside Octane, define scopes with `HotkeysProvider` (see [HotkeysProvider & Scopes](./hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md-886d843a.md#source-hotkeys-docs-framework-octane-guides-hotkeys-provider-and-scopes-md)). For non-Octane UI, such as a dialog mounted by an imperative library, activate a scope directly on the manager and pass that `scope` to its registrations:

```ts
const releaseScope = manager.activateScope('image-viewer', { exclusive: true })
const close = manager.register('Escape', () => viewer.close(), {
  scope: 'image-viewer',
})

// Clean up when the viewer closes
close.unregister()
releaseScope()
```

`activateScope` returns a release function, and a scope remains active until every activation of it has been released. It accepts these options:

- `exclusive` suspends every other scope (including `'global'`), or pass `{ allow: ['global'] }` to keep specific scopes active.
- `parent` names an ancestor scope so this scope takes precedence over it (defaults to `'global'`).

### Read scope state

Call `manager.isScopeActive(scope)` to check whether a scope can currently fire, or inspect each registration's `status` (see [List the hotkeys on screen](./hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md-3e802195.md#source-hotkeys-docs-framework-octane-guides-cheat-sheet-ui-helpers-md)).

`manager.scopes` is a store with these fields:

- `active`: active scopes ordered lowest-to-highest precedence (`'global'` is always active and omitted here)
- `exclusive`: currently controlling exclusive scope, or `null`
- `allowed`: active scopes permitted by the exclusive scope
- `suspended`: active scopes blocked by an exclusive scope (may include `'global'`)
- `characterKeysSuspended`: whether character key shortcuts are suspended by `suspendCharacterKeys`

Inside Octane components, read the same state reactively with `useHotkeyScopesState`:

```tsx
import { useHotkeyScopesState } from '@tanstack/octane-hotkeys'

function KeyboardOwner() @{
  const scopes = useHotkeyScopesState()

  @if (scopes.exclusive) {
    <p>Shortcuts belong to {scopes.exclusive}</p>
  }
}
```

## Suspend character key shortcuts

Call `manager.suspendCharacterKeys()` to pause document-level hotkeys made only of keys that type a character, such as `K`, `Shift+/`, or `['G', 'H']`. Hotkeys with `Control`, `Alt`, or `Meta`, non-character keys such as `Escape`, and hotkeys targeted at an element keep working. Suspensions are counted like scope activations, so character key shortcuts stay suspended until every returned resume function runs:

```ts
const resume = manager.suspendCharacterKeys()
resume()
```

Read `manager.scopes.state.characterKeysSuspended` to check whether character keys are suspended. Inside components, pass `suspendCharacterKeys` to `HotkeysProvider` instead. See [Accessibility](./hotkeys-docs-framework-octane-guides-accessibility-md-283ada15.md#source-hotkeys-docs-framework-octane-guides-accessibility-md).

## Reset sequence progress

Call `manager.resetSequenceProgress()` to clear partial progress on all active sequences, such as when an external UI action cancels a pending command.

## Match a sequence on your own

To match a sequence inside your own `keydown` listener without registering on `HotkeyManager`, use `createSequenceMatcher`:

```ts
import { createSequenceMatcher } from '@tanstack/octane-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (event) => {
  if (matcher.match(event)) scrollToTop()
})
```

The matcher tracks its own state via `getProgress()` and `reset()`. Standalone matchers don't check `ignoreInputs`, call `preventDefault()`, or evaluate scopes, so handle those in your listener if needed.

## Testing

For resetting `HotkeyManager` and `KeyStateTracker` between tests and pinning the platform, see [Testing](./hotkeys-docs-framework-octane-guides-testing-md-9e3a4256.md#source-hotkeys-docs-framework-octane-guides-testing-md).

## Testing

For resetting `HotkeyManager` and `KeyStateTracker` between tests and pinning the platform, see [Testing](./hotkeys-docs-framework-octane-guides-testing-md-9e3a4256.md#source-hotkeys-docs-framework-octane-guides-testing-md).

See the [`HotkeyManager` reference](https://github.com/TanStack/hotkeys/blob/a3fc3ae3a058631dfe821a04edf4cf0cce49fb0a/docs/reference/classes/HotkeyManager.md) for the full method list.
