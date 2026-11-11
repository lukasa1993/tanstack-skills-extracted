# Formatting Display — Format labels in server-rendered apps

[Guide and prerequisites](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md) · Release-matched documentation · `@tanstack/hotkeys@0.27.1`.

## Format labels in server-rendered apps

The server doesn't know the user's platform. Without one, a label rendered on the server uses `'linux'`, so a Mac user gets `Ctrl+S` in the server's HTML and `⌘ S` once React hydrates, with a hydration mismatch. To render the right label from the start:

1. Read the request's `User-Agent` header on the server, and pass `detectPlatform(userAgent)` as the provider's `platform`.
2. Format labels with `useFormatForDisplay()` instead of `formatForDisplay`. `formatForDisplay` doesn't read the provider, so it ignores the platform from step 1. A React Server Component can't call hooks, so pass the platform to `formatForDisplay` there instead. See [Next.js](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#nextjs-app-router).

```tsx
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

<HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
  <App />
</HotkeysProvider>
```

```tsx
import { useFormatForDisplay } from '@tanstack/react-hotkeys'

function Toolbar() {
  // Call it at the top of the component, like any hook
  const format = useFormatForDisplay()

  return (
    <ul>
      {commands.map((command) => (
        <li key={command.id}>
          {command.name} <kbd>{format(command.hotkey)}</kbd>
        </li>
      ))}
    </ul>
  )
}
```

`useFormatForDisplay` returns a function with the same options as `formatForDisplay`. Call the hook once at the top of the component, then call the function anywhere, including in loops and conditions. A `platform` passed to the function wins over the provider's.

In the browser, `detectPlatform()` reads the browser's own `navigator`, so the server and the browser get the same platform for practically every user. The provider's `platform` is also the default platform for hotkeys and recorders inside it. The provider that holds `appHotkeys` also compares app hotkeys on its platform, such as for conflicts. An inner provider inherits it.

Without a provider `platform`, `useFormatForDisplay` renders `'linux'` labels on the server and during hydration, then switches to the browser's platform without a hydration error. Mac users see `Ctrl+S` until React hydrates. Set the provider's `platform` to avoid that.

The provider must render on the server too, so wrap your app in it where the request is available, as shown for each framework below.

Pages rendered this way depend on the request's `User-Agent` header. If a CDN or another shared cache stores them, it can serve one user's labels, and the platform that `Mod` resolves to, to other users. Keep these pages out of shared caches, or add the platform to the cache key. `Vary: User-Agent` also works, but it splits the cache into many small entries.

### TanStack Start

`createIsomorphicFn` reads the request header on the server and the browser's `navigator` in the browser, so no loader is needed:

```tsx
// src/routes/__root.tsx
import { Outlet } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

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

The [TanStack Start example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/react/useFormatForDisplay-tanstack-start) shows this setup.

### Next.js (App Router)

Read the header in a server component, such as the root layout, and pass the platform to the provider. The provider is a client component, so Next sends the value to the browser with the page:

```tsx
// app/layout.tsx
import { headers } from 'next/headers'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const userAgent = (await headers()).get('user-agent')

  return (
    <html lang="en">
      <body>
        <HotkeysProvider defaultOptions={{ platform: detectPlatform(userAgent) }}>
          {children}
        </HotkeysProvider>
      </body>
    </html>
  )
}
```

`useFormatForDisplay` is a hook, so call it in a client component, marked with `'use client'`. In a server component, call `formatForDisplay(hotkey, { platform })` with the platform you detected there instead.

Reading `headers()` renders the layout on each request. For a page that should stay static, see [Static and prerendered pages](./hotkeys-docs-framework-react-guides-formatting-display-md-9091ea8e.md#static-and-prerendered-pages).

The [Next.js example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/react/useFormatForDisplay-nextjs) shows this setup.

### React Router (framework mode)

Detect the platform in the root route's loader, and read it in the root component. React Router sends loader data to the browser with the page:

```tsx
// app/root.tsx
import { Outlet } from 'react-router'
import { HotkeysProvider, detectPlatform } from '@tanstack/react-hotkeys'
import type { Route } from './+types/root'

export function loader({ request }: Route.LoaderArgs) {
  return { platform: detectPlatform(request.headers.get('user-agent')) }
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <HotkeysProvider defaultOptions={{ platform: loaderData.platform }}>
      <Outlet />
    </HotkeysProvider>
  )
}
```

The [React Router example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/react/useFormatForDisplay-react-router) shows this setup.

### Astro

Each React island is its own React app, so render the provider inside the island and pass the platform from the page. The page must render on demand to have a request: add `export const prerender = false`, or use `output: 'server'`.

```astro
---
// src/pages/index.astro
import { detectPlatform } from '@tanstack/react-hotkeys'
import Shortcuts from '../components/Shortcuts'

export const prerender = false
const platform = detectPlatform(Astro.request.headers.get('user-agent'))
---

<Shortcuts client:load platform={platform} />
```

```tsx
// src/components/Shortcuts.tsx
import { HotkeysProvider } from '@tanstack/react-hotkeys'
import type { HotkeyPlatform } from '@tanstack/react-hotkeys'

export default function Shortcuts({ platform }: { platform: HotkeyPlatform }) {
  return (
    <HotkeysProvider defaultOptions={{ platform }}>
      <CheatSheet />
    </HotkeysProvider>
  )
}
```

The [Astro example](https://github.com/TanStack/hotkeys/tree/b0efa6a0b8505e8bc98092ec9da06557ef49b0a4/examples/react/useFormatForDisplay-astro) shows this setup.

### Render a label only in the browser

To skip server rendering for a label instead, render it after hydration. In the browser, plain `formatForDisplay` detects the platform:

```tsx
'use client'

import { useSyncExternalStore } from 'react'
import { formatForDisplay } from '@tanstack/react-hotkeys'
import type { Hotkey } from '@tanstack/react-hotkeys'

const subscribe = () => () => {}

function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  return hydrated ? children : fallback
}

// Formats when it renders, which happens only in the browser
function ShortcutLabel({ hotkey }: { hotkey: Hotkey }) {
  return <kbd>{formatForDisplay(hotkey)}</kbd>
}

<ClientOnly fallback={<kbd>&nbsp;</kbd>}>
  <ShortcutLabel hotkey="Mod+S" />
</ClientOnly>
```

Format inside the component that `ClientOnly` renders, as `ShortcutLabel` does. A `formatForDisplay` call written directly as a child runs in the parent, which can be a Next.js Server Component, so the server's label would be passed in.

Framework wrappers do the same: TanStack Router's `<ClientOnly>`, `next/dynamic` with `ssr: false`, or `client:only="react"` on an Astro island. A fallback with the label's width keeps the layout from shifting.

### Static and prerendered pages

A page rendered at build time has no request and no user, so neither `formatForDisplay` nor `useFormatForDisplay` can know the platform. This includes prerendered routes in TanStack Start and React Router, static pages and `output: 'export'` in Next.js, and Astro's default static output. Render platform-specific labels in a client-only wrapper, as above. `useFormatForDisplay` without a provider `platform` also works there: it shows `'linux'` labels until hydration, then switches.

### Development warning

In development, formatting a label on the server without a platform logs a warning once. Without a platform, the server renders `'linux'` labels, so users on macOS and Windows get a different label after hydration. If you develop on Linux, you won't see the problem yourself. The warning names the missing setting. It isn't included in production builds.
