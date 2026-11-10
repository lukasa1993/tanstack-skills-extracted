# Formatting Display — Format labels in server-rendered apps

[Guide and prerequisites](./hotkeys-docs-framework-octane-guides-formatting-display-md-13293bb7.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.0`.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once Octane hydrates, with a hydration mismatch. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `useFormatForDisplay()` instead of `formatForDisplay`. `formatForDisplay` doesn't read the provider, so it ignores the platform from step 1.

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/octane-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { useFormatForDisplay } from '@tanstack/octane-hotkeys'

function Toolbar() @{
  // Call it at the top level of the component, like any hook
  const format = useFormatForDisplay()

  <ul>
    @for (const command of commands; key command.id) {
      <li>
        {command.name} <kbd>{format(command.hotkey)}</kbd>
      </li>
    }
  </ul>
}
```

`useFormatForDisplay` returns a function with the same options as `formatForDisplay`. Call the hook once at the top level of the component, then call the function anywhere, including in loops and conditions. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `useFormatForDisplay` renders `'linux'` labels on the server and during hydration, then switches to the browser's platform without a hydration error. Mac users see `Ctrl+S` until Octane hydrates. Set the provider's `platform` to avoid that.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each setup below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### TanStack Start

`@octanejs/tanstack-start` runs TanStack Start with Octane. `createIsomorphicFn` reads the request header on the server and the browser's `navigator` in the browser, so no loader is needed:

```tsx
// src/routes/__root.tsrx
import { Outlet } from '@octanejs/tanstack-router'
import { createIsomorphicFn } from '@octanejs/tanstack-start'
import { getRequestHeader } from '@octanejs/tanstack-start/server'
import { HotkeysProvider, detectPlatform } from '@tanstack/octane-hotkeys'

const getPlatform = createIsomorphicFn()
  .server(() => detectPlatform(getRequestHeader('user-agent')))
  .client(() => detectPlatform())

function RootLayout() @{
  <HotkeysProvider defaultOptions={{ platform: getPlatform() }}>
    <Outlet />
  </HotkeysProvider>
}
```

Pass `RootLayout` as the `component` of the root route.

### Astro

With `@octanejs/astro`, each Octane island is its own Octane app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/octane-hotkeys'
import { Shortcuts } from '../components/Shortcuts.tsrx'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```tsx
// src/components/Shortcuts.tsrx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'
import type { HotkeyPlatform } from '@tanstack/octane-hotkeys'

export function Shortcuts({ platform }: { platform: HotkeyPlatform }) @{
  <HotkeysProvider defaultOptions={{ platform }}>
    <CheatSheet />
  </HotkeysProvider>
}
```

The [Astro example](https://github.com/TanStack/hotkeys/tree/e7cbe578686100589221c8a0b6140496985e6c45/examples/octane/useFormatForDisplay-astro) shows this setup.

### Your own server

Render your app with `renderToString` from `octane/server`, and pass the platform as a prop. In the browser, `detectPlatform()` returns the same platform, so `hydrateRoot` gets the same props:

```tsx
// src/App.tsrx
import { HotkeysProvider } from '@tanstack/octane-hotkeys'
import type { HotkeyPlatform } from '@tanstack/octane-hotkeys'

export function App({ platform }: { platform: HotkeyPlatform }) @{
  <HotkeysProvider defaultOptions={{ platform }}>
    <Toolbar />
  </HotkeysProvider>
}
```

```ts
// src/entry-server.ts
import { renderToString } from 'octane/server'
import { detectPlatform } from '@tanstack/octane-hotkeys'
import { App } from './App.tsrx'

export function render(request: Request) {
  const platform = detectPlatform(request.headers.get('user-agent'))
  return renderToString(App, { platform }) // { html, css }
}
```

```ts
// src/entry-client.ts
import { hydrateRoot } from 'octane'
import { detectPlatform } from '@tanstack/octane-hotkeys'
import { App } from './App.tsrx'

hydrateRoot(document.getElementById('app')!, App, { platform: detectPlatform() })
```

Put `css` in the page's `<head>` and `html` in the element you hydrate. `render` takes a Fetch API `Request`. In Express, pass `req.headers['user-agent']` to `detectPlatform` instead. Octane's [server-side rendering guide](https://github.com/octanejs/octane/blob/main/docs/ssr.md) covers compiling the server build and streaming.

The [server rendering example](https://github.com/TanStack/hotkeys/tree/e7cbe578686100589221c8a0b6140496985e6c45/examples/octane/useFormatForDisplay-server) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. In the browser, plain `formatForDisplay` detects the platform:

```tsx
import { useSyncExternalStore } from 'octane'
import { formatForDisplay } from '@tanstack/octane-hotkeys'

const subscribe = () => () => {}

function SaveShortcut() @{
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)

  @if (hydrated) {
    <kbd>{formatForDisplay('Mod+S')}</kbd>
  } @else {
    <kbd>{' '}</kbd>
  }
}
```

Framework wrappers do the same: `<ClientOnly>` from `@octanejs/tanstack-router`, or `client:only="octane"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `useFormatForDisplay` can know the platform. This includes prerendered routes in TanStack Start, Astro's default static output, and pages rendered with `prerender` from `octane/static`. Render platform-specific labels in a client-only wrapper, as above. `useFormatForDisplay` without a provider `platform` also works there: it shows `'linux'` labels until hydration, then switches.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so users on macOS and Windows get a different label after hydration. If you develop on Linux, you won't see the problem yourself. The warning names the missing setting. It isn't included in production builds.
