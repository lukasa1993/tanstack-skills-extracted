# Stores — Authorization

[Guide and prerequisites](./tanstack-ai-persistence-stores-e6061122.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## Authorization

Store methods take bare `threadId`s. **Authorize at the route** before
`loadThread` / `saveThread` / `reconstructChat({ authorize })`. Derive user
identity from session, not the client body alone.
