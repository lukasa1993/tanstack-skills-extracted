# Custom Adapter — Overview

[Guide and prerequisites](./tanstack-db-core-custom-adapter-3b9cb5f2.md) · Published skill · `@tanstack/db@0.11.1`.

This skill builds on db-core and db-core/collection-setup. Read those first.

# Custom Adapter Authoring

Each call to an adapter's `sync()` function starts a **sync run**. The run owns
the callbacks and resources installed by that call until its returned cleanup
ends them. A sync run may make several backend requests or open a longer-lived
provider session, so do not use “request” or “session” as a synonym for the
run.
