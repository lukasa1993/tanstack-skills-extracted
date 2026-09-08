# Stores — Timestamp convention

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## Timestamp convention

Store _records_ (`RunRecord`, `InterruptRecord`) speak **epoch milliseconds**
(`number`). Wire/result references that leave the persistence layer speak
**ISO-8601 strings**; the middleware converts at the boundary. Do not mix the
two on one field.
