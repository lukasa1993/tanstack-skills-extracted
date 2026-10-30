# Ai Persistence — State persistence has two halves

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## State persistence has two halves

| Half       | Stores                                          | Survives                         | Typical use                              |
| ---------- | ----------------------------------------------- | -------------------------------- | ---------------------------------------- |
| **Client** | transcript ± resume pointer in browser storage  | reload / tab close (per browser) | SPA restore, offline-first               |
| **Server** | messages, runs, interrupts, metadata in your DB | restart + multi-device           | authoritative history, durable approvals |

They are independent. Use either alone or both.
