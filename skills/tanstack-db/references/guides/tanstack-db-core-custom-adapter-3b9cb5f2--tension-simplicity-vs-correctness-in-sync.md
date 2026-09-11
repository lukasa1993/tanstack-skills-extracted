# Custom Adapter — Tension: Simplicity vs. Correctness in Sync

[Guide and prerequisites](./tanstack-db-core-custom-adapter-3b9cb5f2.md) · Published skill · `@tanstack/db@0.9.0`.

## Tension: Simplicity vs. Correctness in Sync

Getting-started simplicity (localOnly, eager mode) conflicts with production correctness (on-demand sync, race condition prevention, proper markReady handling). Agents optimizing for quick setup tend to skip buffering, markReady, and cleanup functions.

See also: ./tanstack-db-core-collection-setup-883eba1c.md#source-tanstack-db-core-collection-setup — for built-in adapter patterns to model after.
