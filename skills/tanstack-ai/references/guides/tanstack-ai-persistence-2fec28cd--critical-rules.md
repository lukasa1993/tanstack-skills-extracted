# Ai Persistence — Critical rules

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## Critical rules

1. **Not Vercel AI SDK.** Persistence is `@tanstack/ai-persistence` + middleware, not Vercel `useChat` storage hacks.
2. **`saveThread` is full overwrite**, never append.
3. **`createOrResume` is insert-if-absent** for the same `runId`.
4. **Interrupt `create` is insert-if-absent** — never clobber resolved → pending.
5. **Locks ≠ state.** Import `withLocks` from `@tanstack/ai/locks`. Sandbox resume is a sandbox-package concern — not a `stores` key. `stores` accepts only `messages`, `runs`, `interrupts`, `metadata`.
6. **You own the schema.** No package invents migrations for you.
7. **Run the conformance testkit** against any adapter you write.
8. **Authorize thread access** at the route boundary.
9. **Keep keys out of `stores`.** Use a `CredentialStore`: encrypted at rest, keyed by tenant and user, hard delete. See Secure persistence.
