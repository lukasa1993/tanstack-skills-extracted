# Devtools Vite Plugin — Architecture: Sub-Plugins

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Architecture: Sub-Plugins

`devtools()` returns an array of Vite plugins. Each has `enforce: 'pre'` and only activates when its conditions are met (dev mode, serve command, etc.).

| Sub-plugin name                               | What it does                                                                                                       | When active                                                |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `@tanstack/devtools:inject-source`            | AST transform adding `data-tsd-source` attrs to JSX                                                                | dev mode + `injectSource.enabled`                          |
| `@tanstack/devtools:config`                   | Reserved for future config modifications                                                                           | serve command only                                         |
| `@tanstack/devtools:custom-server`            | Starts ServerEventBus, registers middleware for open-source/console-pipe endpoints                                 | dev mode                                                   |
| `@tanstack/devtools:remove-devtools-on-build` | Strips devtools imports/JSX from production bundles                                                                | build command or production mode + `removeDevtoolsOnBuild` |
| `@tanstack/devtools:event-client-setup`       | Marketplace: listens for install/add-plugin events via devtoolsEventClient                                         | dev mode + serve + not CI                                  |
| `@tanstack/devtools:console-pipe-transform`   | Injects runtime console-pipe code into entry files                                                                 | dev mode + serve + `consolePiping.enabled`                 |
| `@tanstack/devtools:better-console-logs`      | AST transform prepending source location to `console.log`/`console.error`                                          | dev mode + `enhancedLogs.enabled`                          |
| `@tanstack/devtools:inject-plugin`            | Detects which file imports TanStackDevtools (for marketplace injection)                                            | dev mode + serve                                           |
| `@tanstack/devtools:connection-injection`     | Replaces `__TANSTACK_DEVTOOLS_PORT__`, `__TANSTACK_DEVTOOLS_HOST__`, `__TANSTACK_DEVTOOLS_PROTOCOL__` placeholders | dev mode + serve                                           |
