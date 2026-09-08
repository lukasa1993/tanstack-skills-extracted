# Devtools Bidirectional — Overview

[Guide and prerequisites](./tanstack-devtools-event-client-devtools-bidirectional-02c62d88.md) · Published skill · `@tanstack/devtools-event-client@0.5.0`.

# devtools-bidirectional

> **Prerequisite:** Read and understand the `devtools-event-client` skill first. This skill builds on `EventClient`, its event map types, `emit()`/`on()` API, pluginId namespacing, connection lifecycle, and singleton pattern. Everything here assumes you already have a working `EventClient` instance.

Two-way communication between your application and a TanStack Devtools panel using `EventClient`. The same client instance handles both directions: the app emits observation events that the panel listens to, and the panel emits command events that the app listens to.
