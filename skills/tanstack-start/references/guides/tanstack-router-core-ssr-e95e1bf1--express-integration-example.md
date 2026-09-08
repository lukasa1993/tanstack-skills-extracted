# Ssr — Express Integration Example

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Express Integration Example

`createRequestHandler` expects a Web API `Request` and returns a Web API `Response`. For Express, convert between formats:

```tsx
// src/entry-server.tsx
import { pipeline } from 'node:stream/promises'
import {
  RouterServer,
  createRequestHandler,
  renderRouterToString,
} from '@tanstack/react-router/ssr/server'
import { createRouter } from './router'
import type express from 'express'

export async function render({
  req,
  res,
}: {
  req: express.Request
  res: express.Response
}) {
  const protocol = req.get('x-forwarded-proto') ?? req.protocol
  const host = req.get('x-forwarded-host') ?? req.get('host')
  const url = new URL(req.originalUrl || req.url, `${protocol}://${host}`).href

  const request = new Request(url, {
    method: req.method,
    headers: (() => {
      const headers = new Headers()
      for (const [key, value] of Object.entries(req.headers)) {
        headers.set(key, value as any)
      }
      return headers
    })(),
  })

  const handler = createRequestHandler({ request, createRouter })

  const response = await handler(({ responseHeaders, router }) =>
    renderRouterToString({
      responseHeaders,
      router,
      children: <RouterServer router={router} />,
    }),
  )

  res.status(response.status)
  response.headers.forEach((value, name) => {
    res.setHeader(name, value)
  })

  return pipeline(response.body as any, res)
}
```
