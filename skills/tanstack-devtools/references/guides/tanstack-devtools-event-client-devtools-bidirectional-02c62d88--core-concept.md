# Devtools Bidirectional — Core Concept

[Guide and prerequisites](./tanstack-devtools-event-client-devtools-bidirectional-02c62d88.md) · Published skill · `@tanstack/devtools-event-client@0.5.0`.

## Core Concept

`EventClient` is not unidirectional. Both `emit()` and `on()` work from either side -- application code or panel code -- on the same shared event bus. The direction is a convention you establish through your event map design, not a limitation of the API.

```
App code calls:    client.emit('state-update', ...)     // observation
Panel code calls:  client.on('state-update', ...)       // observation

Panel code calls:  client.emit('set-state', ...)        // command
App code calls:    client.on('set-state', ...)          // command
```
