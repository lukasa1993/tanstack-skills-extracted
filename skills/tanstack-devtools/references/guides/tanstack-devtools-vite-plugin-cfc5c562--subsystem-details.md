# Devtools Vite Plugin — Subsystem Details

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Subsystem Details

### Source Injection

Adds `data-tsd-source="<relative-path>:<line>:<column>"` attributes to every JSX opening element via oxc-parser + MagicString. This powers the "Go to Source" feature -- hold the inspect hotkey (default: Shift+Alt+Ctrl/Meta), hover over elements, click to open in editor.

**Key behaviors:**

- Skips `<Fragment>` and `<React.Fragment>`
- Skips elements where the component's props parameter is spread (`{...props}`) -- this is because injecting the attribute would be overwritten by the spread
- Skips files matching `injectSource.ignore.files` patterns
- Skips components matching `injectSource.ignore.components` patterns
- Patterns can be strings (matched via picomatch) or RegExp
- Transform filter excludes `node_modules`, `?raw` imports, `/dist/`, `/build/`

**Source files:** `packages/devtools-vite/src/inject-source.ts`, `packages/devtools-vite/src/matcher.ts`

```ts
devtools({
  injectSource: {
    enabled: true,
    ignore: {
      files: ['node_modules', /.*\.test\.(js|ts|jsx|tsx)$/],
      components: ['InternalComponent', /.*Provider$/],
    },
  },
})
```

### Console Piping

Bidirectional console piping between client and server. Injects runtime code (IIFE) into entry files that:

**Client side:**

1. Wraps `console[level]` to batch and POST entries to `/__tsd/console-pipe`
2. Opens an EventSource on `/__tsd/console-pipe/sse` to receive server logs
3. Server logs appear in browser console with a purple `[Server]` prefix
4. Client logs appear in terminal with a cyan `[Client]` prefix

**Server side (SSR/Nitro):**

1. Wraps `console[level]` to batch and POST entries to `<viteServerUrl>/__tsd/console-pipe/server`
2. These are then broadcast to all SSE clients

**Entry file detection:** looks for `<html` tag, `StartClient`, `hydrateRoot`, `createRoot`, or `solid-js/web` + `render(` in code.

**Source files:** `packages/devtools-vite/src/virtual-console.ts`, `packages/devtools-vite/src/utils.ts` (middleware handlers)

```ts
devtools({
  consolePiping: {
    enabled: true,
    levels: ['log', 'warn', 'error', 'info', 'debug'],
  },
})
```

### Enhanced Logging

AST transform that prepends source location info to `console.log()` and `console.error()` calls. In the browser, this renders as a clickable "Go to Source" link. On the server, it shows `LOG <path>:<line>:<column>` in chalk colors.

The transform inserts a spread of a conditional expression: `...(typeof window === 'undefined' ? serverLogMessage : browserLogMessage)` as the first argument of the console call.

**Source file:** `packages/devtools-vite/src/enhance-logs.ts`

```ts
devtools({
  enhancedLogs: {
    enabled: true, // default
  },
})
```

### Production Stripping

Removes all devtools code from production builds. The transform:

1. Finds files importing from these packages: `@tanstack/react-devtools`, `@tanstack/preact-devtools`, `@tanstack/solid-devtools`, `@tanstack/vue-devtools`, `@tanstack/devtools`
2. Removes the import declarations
3. Removes the JSX elements that use the imported components
4. Cleans up leftover imports that were only used inside the removed JSX (e.g., plugin panel components)

Active when: `command !== 'serve'` OR `config.mode === 'production'` (handles hosting providers like Cloudflare/Netlify that may not use `build` command but set mode to production).

**Source file:** `packages/devtools-vite/src/remove-devtools.ts`

```ts
devtools({
  removeDevtoolsOnBuild: true, // default
})
```

### Server Event Bus

A WebSocket + SSE server for devtools-to-client communication. Managed by `@tanstack/devtools-event-bus/server`.

**Key behaviors:**

- Default port: 4206
- On EADDRINUSE: falls back to OS-assigned port (port 0)
- When Vite uses HTTPS: piggybacks on Vite's httpServer instead of creating a standalone one (shares TLS certificate)
- Uses global variables (`__TANSTACK_DEVTOOLS_SERVER__`, etc.) to survive HMR without restarting
- The actual port is injected into client code via `__TANSTACK_DEVTOOLS_PORT__` placeholder replacement

**Source file:** `packages/event-bus/src/server/server.ts`

```ts
devtools({
  eventBusConfig: {
    port: 4206, // default
    enabled: true, // default; set false for storybook/vitest
    debug: false, // default; logs internal bus activity
  },
})
```

### Editor Integration

Uses `launch-editor` to open source files in the editor. Default editor is VS Code. The `editor.open` callback receives `(path, lineNumber, columnNumber)` as strings.

The open-source flow: browser requests `/__tsd/open-source?source=<encoded-path:line:col>` --> Vite middleware parses source param --> calls `editor.open`.

Supported editors via launch-editor: VS Code, WebStorm, Sublime Text, Atom, and more. For unsupported editors, provide a custom `editor.open` function.

**Source file:** `packages/devtools-vite/src/editor.ts`

```ts
devtools({
  editor: {
    name: 'Cursor',
    open: async (path, lineNumber, columnNumber) => {
      // Custom editor open logic
      // path is the absolute file path
      // lineNumber and columnNumber are strings or undefined
    },
  },
})
```

### Plugin Marketplace

When the dev server is running, listens for events via `devtoolsEventClient`:

- `install-devtools` -- runs package manager install, then auto-injects plugin into devtools setup file
- `add-plugin-to-devtools` -- injects plugin import and JSX/function call into the file containing `<TanStackDevtools>`
- `bump-package-version` -- updates a package to a minimum version
- `mounted` -- sends package.json and outdated deps to the UI

Auto-detection of the devtools setup file: the `inject-plugin` sub-plugin scans transforms for files importing from `@tanstack/react-devtools`, `@tanstack/solid-devtools`, `@tanstack/vue-devtools`, etc., and stores the file ID.

**Source files:** `packages/devtools-vite/src/inject-plugin.ts`, `packages/devtools-vite/src/package-manager.ts`
