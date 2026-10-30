# Ai Persistence — Authoritative-history contract

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## Authoritative-history contract

When both halves run, ownership per turn is decided by request `messages`:

| Client sends             | Meaning                           | On finish                           |
| ------------------------ | --------------------------------- | ----------------------------------- |
| **Non-empty** `messages` | Full transcript (source of truth) | Server **overwrites** stored thread |
| **Empty** `messages`     | Continue from server copy         | Server **loads** stored thread      |

Never post a delta as `messages` — that wipes history down to the delta.

**Client-authoritative:** always send full transcript; browser is truth, server mirrors.
**Server-authoritative:** send empty `messages` (or hydrate via server load); server is truth, multi-device works.
