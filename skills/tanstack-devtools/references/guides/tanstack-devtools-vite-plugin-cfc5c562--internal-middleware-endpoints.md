# Devtools Vite Plugin — Internal Middleware Endpoints

[Guide and prerequisites](./tanstack-devtools-vite-plugin-cfc5c562.md) · Published skill · `@tanstack/devtools-vite@0.8.5`.

## Internal Middleware Endpoints

These are registered on the Vite dev server (not the event bus server):

| Endpoint                                    | Method | Purpose                                                   |
| ------------------------------------------- | ------ | --------------------------------------------------------- |
| `/__tsd/open-source?source=<path:line:col>` | GET    | Opens file in editor, returns HTML that closes the window |
| `/__tsd/console-pipe`                       | POST   | Receives client console entries (batched JSON)            |
| `/__tsd/console-pipe/server`                | POST   | Receives server-side console entries                      |
| `/__tsd/console-pipe/sse`                   | GET    | SSE stream for broadcasting server logs to browser        |
