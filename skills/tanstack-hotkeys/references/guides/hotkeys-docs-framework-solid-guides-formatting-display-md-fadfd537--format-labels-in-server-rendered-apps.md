# Formatting Display — Format labels in server-rendered apps

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-formatting-display-md-fadfd537.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML. Solid keeps the server's text when it hydrates, so the label stays `Ctrl+S`, and Solid doesn't warn about it. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `createFormatForDisplay()` instead of `formatForDisplay`. `formatForDisplay` doesn't read the provider, so it ignores the platform from step 1.

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { For } from 'solid-js'
import { createFormatForDisplay } from '@tanstack/solid-hotkeys'

function Toolbar() {
  // Call it in the component, like other primitives
  const format = createFormatForDisplay()

  return (
    <ul>
      <For each={commands}>
        {(command) => (
          <li>
            {command.name} <kbd>{format(command.hotkey)}</kbd>
          </li>
        )}
      </For>
    </ul>
  )
}
```

`createFormatForDisplay` returns a function with the same options as `formatForDisplay`. Call `createFormatForDisplay` once in the component, then call the function anywhere in its JSX. The function reads the provider's `platform` each time it runs, so a label in JSX updates when the platform changes. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `createFormatForDisplay` renders `'linux'` labels on the server, and Mac users keep them after hydration. Set the provider's `platform` in every server-rendered app.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### SolidStart

`getRequestEvent()` from `solid-js/web` returns the current request on the server and `undefined` in the browser. Without a user agent, `detectPlatform` reads the browser's `navigator`, so the same code works on both sides:

```tsx
// src/app.tsx
import { Suspense } from 'solid-js'
import { getRequestEvent } from 'solid-js/web'
import { Router } from '@solidjs/router'
import { FileRoutes } from '@solidjs/start/router'
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'

export default function App() {
  const userAgent =
    getRequestEvent()?.request.headers.get('user-agent')

  return (
    <HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
      <Router root={(props) => <Suspense>{props.children}</Suspense>}>
        <FileRoutes />
      </Router>
    </HotkeysProvider>
  )
}
```

The [SolidStart example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/solid/createFormatForDisplay-solid-start) shows this setup.

### TanStack Start

`createIsomorphicFn` reads the request header on the server and the browser's `navigator` in the browser, so no loader is needed:

```tsx
// src/routes/__root.tsx
import { Outlet } from '@tanstack/solid-router'
import { createIsomorphicFn } from '@tanstack/solid-start'
import { getRequestHeader } from '@tanstack/solid-start/server'
import { HotkeysProvider, detectPlatform } from '@tanstack/solid-hotkeys'

const getPlatform = createIsomorphicFn()
  .server(() => detectPlatform(getRequestHeader('user-agent')))
  .client(() => detectPlatform())

function RootComponent() {
  return (
    <HotkeysProvider defaultOptions={{ platform: getPlatform() }}>
      <Outlet />
    </HotkeysProvider>
  )
}
```

The [TanStack Start example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/solid/createFormatForDisplay-tanstack-start) shows this setup.

### Astro

Each Solid island is its own Solid app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/solid-hotkeys'
import Shortcuts from '../components/Shortcuts'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```tsx
// src/components/Shortcuts.tsx
import { HotkeysProvider } from '@tanstack/solid-hotkeys'
import type { HotkeyPlatform } from '@tanstack/solid-hotkeys'

export default function Shortcuts(props: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform: props.platform }}>
      <CheatSheet />
    </HotkeysProvider>
  )
}
```

The [Astro example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/solid/createFormatForDisplay-astro) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. In the browser, plain `formatForDisplay` detects the platform:

```tsx
import { Show, createSignal, onMount } from 'solid-js'
import { formatForDisplay } from '@tanstack/solid-hotkeys'
import type { JSX } from 'solid-js'

function ClientOnly(props: { children: JSX.Element; fallback?: JSX.Element }) {
  const [mounted, setMounted] = createSignal(false)
  onMount(() => setMounted(true))
  return (
    <Show when={mounted()} fallback={props.fallback}>
      {props.children}
    </Show>
  )
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <kbd>{formatForDisplay('Mod+S')}</kbd>
</ClientOnly>
```

`onMount` runs only in the browser, after hydration, so the server and the first render in the browser both show the fallback. Framework wrappers do the same: TanStack Router's `<ClientOnly>` from `@tanstack/solid-router`, SolidStart's `clientOnly()`, or `client:only="solid-js"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

Don't use `<NoHydration>` or an `isServer` check for labels. `<NoHydration>` keeps the server's label, and rendering different content on the server and in the browser breaks hydration.

### Static and prerendered pages

A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `createFormatForDisplay` can know the platform. This includes prerendered routes in SolidStart and TanStack Start, and Astro's default static output. Render platform-specific labels in a client-only wrapper, as above. Don't use `createFormatForDisplay` without a provider `platform` there: Solid keeps the `'linux'` labels from the build.

### Development warning

In development, formatting a label on the server without a platform logs a warning once, because the label uses `'linux'` and Solid keeps it after hydration. The warning names the missing setting. It isn't included in production builds.
