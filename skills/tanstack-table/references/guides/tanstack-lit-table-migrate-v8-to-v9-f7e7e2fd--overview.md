# Migrate V8 To V9 — Overview

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

Use this as the complete breaking-change checklist. V9 is the current API. The central Lit change is a stable controller constructed with the host, while current options are passed to `.table(...)` during render.

Framework prerequisites: Lit 3.1.3 or newer within v3 (`lit ^3.1.3`) and
`@lit/context ^1.1.0`.
