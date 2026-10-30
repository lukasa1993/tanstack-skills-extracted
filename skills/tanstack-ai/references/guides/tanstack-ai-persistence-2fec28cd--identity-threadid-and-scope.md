# Ai Persistence — Identity: `threadId` and `Scope`

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## Identity: `threadId` and `Scope`

Server stores key on **`threadId`** (same as `chat({ threadId })` /
`ChatMiddlewareContext.threadId` / `Scope.threadId` from `@tanstack/ai`).

- Store methods take bare `threadId` strings for adapter simplicity.
- Multi-user isolation is **your** job: derive `userId` / `tenantId` from
  session server-side; authorize before load/save / `reconstructChat`.
- Never treat a client-supplied thread id alone as ownership — ids are guessable.
