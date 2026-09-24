# Devtools Production — @tanstack/devtools-webmcp root import

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.15.0`.

## @tanstack/devtools-webmcp root import

When `process.env.NODE_ENV` is `'development'`, the root import is the real helper.

```ts
import { registerDevtoolsTools } from '@tanstack/devtools-webmcp'
```

In every other environment, the root import is a no-op. An unset `NODE_ENV` is a no-op too.

Bundlers remove the real helper. The tool objects stay in the library bundle. The no-op does not call the browser. The no-op does not keep the tools object.

If the tools must stay registered in production, import `@tanstack/devtools-webmcp/production`.

```ts
import { registerDevtoolsTools } from '@tanstack/devtools-webmcp/production'
```

The import `@tanstack/devtools-webmcp/production` is always the real helper.

The `registerDevtoolsTools` call stays the same. The call is in `docs/webmcp-tools.md`.
