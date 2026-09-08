# Ssr — Non-Streaming SSR

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Non-Streaming SSR

### Server Entry (using `defaultRenderHandler`)

```tsx
// src/entry-server.tsx
import {
  createRequestHandler,
  defaultRenderHandler,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export async function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })
  return await handler(defaultRenderHandler)
}
```

### Server Entry (using `renderRouterToString` for custom wrappers)

```tsx
// src/entry-server.tsx
import {
  createRequestHandler,
  renderRouterToString,
  RouterServer,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'

export function render({ request }: { request: Request }) {
  const handler = createRequestHandler({ request, createRouter })

  return handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  )
}
```

### Client Entry

```tsx
// src/entry-client.tsx
import { hydrateRoot } from 'react-dom/client'
import { RouterClient } from '@tanstack/react-router/ssr/client'
import { createRouter } from './router'

const router = createRouter()

hydrateRoot(document, <RouterClient router={router} />)
```
