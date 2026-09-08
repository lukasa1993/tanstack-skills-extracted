# Devtools Vite Plugin — Key Source Files

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Key Source Files

- `packages/devtools-vite/src/plugin.ts` -- Main plugin factory with all sub-plugins and config type
- `packages/devtools-vite/src/inject-source.ts` -- AST transform for data-tsd-source injection
- `packages/devtools-vite/src/enhance-logs.ts` -- AST transform for enhanced console logs
- `packages/devtools-vite/src/remove-devtools.ts` -- Production stripping transform
- `packages/devtools-vite/src/virtual-console.ts` -- Console pipe runtime code generator
- `packages/devtools-vite/src/editor.ts` -- Editor config type and launch-editor integration
- `packages/devtools-vite/src/inject-plugin.ts` -- Marketplace plugin injection into devtools setup file
- `packages/devtools-vite/src/utils.ts` -- Middleware request handling and helpers
- `packages/devtools-vite/src/matcher.ts` -- Picomatch/RegExp pattern matcher
- `packages/event-bus/src/server/server.ts` -- ServerEventBus implementation (WebSocket + SSE + EADDRINUSE fallback)
