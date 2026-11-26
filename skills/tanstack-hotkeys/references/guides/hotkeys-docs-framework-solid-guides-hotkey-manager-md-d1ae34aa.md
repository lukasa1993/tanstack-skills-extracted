# Hotkey Manager

<a id="source-hotkeys-docs-framework-solid-guides-hotkey-manager-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

This is an advanced guide. Inside Solid components, `createHotkey` and `createHotkeys` register hotkeys, clean them up on disposal, apply provider defaults and scopes, and follow signals. Use `HotkeyManager` directly only outside Solid components, such as inside third-party chart or canvas wrappers.

All hotkeys on a page share a single `HotkeyManager` instance that owns the DOM event listeners, matches key presses, tracks sequence progress, and evaluates scopes. Access it with `getHotkeyManager()`:

```ts
import { getHotkeyManager } from '@tanstack/solid-hotkeys'

const manager = getHotkeyManager()
```

## Register a hotkey

`manager.register` accepts the same hotkeys and options as `createHotkey` and returns a registration handle:

```ts
const handle = manager.register('Mod+K', () => openCommandPalette())

handle.setOptions({ enabled: false }) // Merges updated options
handle.callback = () => openSearch() // Updates callback in place
handle.unregister() // Removes the registration
```

Keep a few differences from `createHotkey` in mind:

- **Manual cleanup.** Registrations stay active until `handle.unregister()` is called.
- **No Solid context.** Provider `defaultOptions` and provider scopes don't apply. Registrations use the built-in defaults and `'global'` scope unless a `scope` is passed.
- **Plain values.** The hotkey and options are plain values, not accessors. To change options later, call `handle.setOptions`.
- **Element targets only.** Pass a DOM element, `document`, or `window` (not a signal). A `null` target, like an empty `querySelector`, returns a no-op handle and doesn't wait for the element, so call `register` again once it exists. An omitted or `undefined` target listens on `document`.
- **SSR safe.** During server rendering, `register` returns a no-op handle.

For example, wiring shortcuts inside a vanilla chart plugin:

```ts
import { getHotkeyManager } from '@tanstack/solid-hotkeys'

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

Inside components, read registrations with `createHotkeyRegistrations` (see [List the hotkeys on screen](./hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md-db8cc71d.md#source-hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md)). Outside components, query the manager directly:

```ts
manager.getRegistrationCount() // Total registered hotkeys
manager.isRegistered('Mod+S') // Whether any registration matches
manager.isRegistered('Escape', panelElement) // Whether one matches on that target
```

`isRegistered` uses canonical matching just like [duplicate detection](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#source-hotkeys-docs-framework-solid-guides-hotkeys-md), so `'Meta+S'` matches a `'Mod+S'` registration on macOS.

`manager.registrations` reads and subscribes like a [TanStack Store](https://tanstack.com/store) holding a `Map` of registrations by ID:

```ts
const subscription = manager.registrations.subscribe((registrations) => {
  console.log(`${registrations.size} hotkeys registered`)
})

subscription.unsubscribe()
```

Because this store updates whenever a hotkey fires or a sequence step advances, keep subscribers lightweight. Raw registrations include `callback`. For the callback-free shape returned by `createHotkeyRegistrations`, pass a registration to `toHotkeyRegistrationView`.

## Activate a scope

Inside Solid, define scopes with `HotkeysProvider` (see [HotkeysProvider & Scopes](./hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md-aa492c2f.md#source-hotkeys-docs-framework-solid-guides-hotkeys-provider-and-scopes-md)). For non-Solid UI, such as a dialog mounted by an imperative library, activate a scope directly on the manager and pass that `scope` to its registrations:

```ts
const releaseScope = manager.activateScope('image-viewer', { exclusive: true })
const close = manager.register('Escape', () => viewer.close(), {
  scope: 'image-viewer',
})

// Clean up when the viewer closes
close.unregister()
releaseScope()
```

`activateScope` returns a release function, and a scope remains active until every activation of it has been released. It accepts two options:

- `exclusive` suspends every other scope (including `'global'`), or pass `{ allow: ['global'] }` to keep specific scopes active.
- `parent` names an ancestor scope so this scope takes precedence over it (defaults to `'global'`).

### Read scope state

Call `manager.isScopeActive(scope)` to check whether a scope can currently fire, or inspect each registration's `status` (see [List the hotkeys on screen](./hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md-db8cc71d.md#source-hotkeys-docs-framework-solid-guides-cheat-sheet-ui-helpers-md)).

`manager.scopes` is a store with four fields:

- `active`: active scopes ordered lowest-to-highest precedence (`'global'` is always active and omitted here)
- `exclusive`: currently controlling exclusive scope, or `null`
- `allowed`: active scopes permitted by the exclusive scope
- `suspended`: active scopes blocked by an exclusive scope (may include `'global'`)

Inside Solid components, read the same state reactively with `createHotkeyScopesState`. It updates when scopes activate or release:

```tsx
import { Show } from 'solid-js'
import { createHotkeyScopesState } from '@tanstack/solid-hotkeys'

function KeyboardOwner() {
  const scopes = createHotkeyScopesState()

  return (
    <Show when={scopes().exclusive}>
      {(owner) => <p>Shortcuts belong to {owner()}</p>}
    </Show>
  )
}
```

The [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) display the same live scope state without writing code.

## Reset sequence progress

Call `manager.resetSequenceProgress()` to clear partial progress on all active sequences, such as when an external UI action cancels a pending command.

## Match a sequence on your own

To match a sequence inside your own `keydown` listener without registering on `HotkeyManager`, use `createSequenceMatcher`:

```ts
import { createSequenceMatcher } from '@tanstack/solid-hotkeys'

const matcher = createSequenceMatcher(['G', 'G'], { timeout: 1000 })

document.addEventListener('keydown', (event) => {
  if (matcher.match(event)) scrollToTop()
})
```

The matcher tracks its own state via `getProgress()` and `reset()`. Standalone matchers don't check `ignoreInputs`, call `preventDefault()`, or evaluate scopes, so handle those in your listener if needed.

## Testing

For resetting `HotkeyManager` and `KeyStateTracker` between tests and pinning the platform, see [Testing](./hotkeys-docs-framework-solid-guides-testing-md-81642277.md#source-hotkeys-docs-framework-solid-guides-testing-md).

## Testing

For resetting `HotkeyManager` and `KeyStateTracker` between tests and pinning the platform, see [Testing](./hotkeys-docs-framework-solid-guides-testing-md-81642277.md#source-hotkeys-docs-framework-solid-guides-testing-md).

See the [`HotkeyManager` reference](https://github.com/TanStack/hotkeys/blob/fc48fc09f82cd285da5e0991948d604cec2a3263/docs/reference/classes/HotkeyManager.md) for the full method list.
