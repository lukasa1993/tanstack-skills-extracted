# Ssr — Concepts

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## Concepts

There are two SSR flavors:

- **Non-streaming**: Full page rendered on server, sent as one HTML response, then hydrated on client.
- **Streaming**: Critical first paint sent immediately; remaining content streamed incrementally as it resolves.

Key behaviors:

- Memory history is used automatically on the server (no `window`).
- Loader data is automatically dehydrated on the server and hydrated on the client.
- Data serialization supports `Date`, `Error`, `FormData`, and `undefined` out of the box.
