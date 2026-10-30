# Ai Persistence — Secure persistence

[Guide and prerequisites](./tanstack-ai-persistence-2fec28cd.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## Secure persistence

Keys and tokens are not part of `stores`. They use a `CredentialStore` from
`@tanstack/ai/byok`. Many apps still keep it in the same database as the chat
stores, as a `credentials` table, written with the same client. A secrets
manager works too.

**`CredentialStore`** holds API keys and OAuth tokens. Pass it to
`createHarnessHost({ credentials })` or read it with
`storedProviderKeys(store, scope)` from `@tanstack/ai/byok/server`.
`memoryCredentialStore()` is for dev and tests: keys vanish on restart. Rules
for a real one:

- **Encrypt every secret value at rest** (`value`, `accessToken`,
  `refreshToken`, `client.clientSecret`). Use envelope encryption with a key
  from a KMS or a server-only env var. Never store the plain text, and never
  keep the encryption key in the same database.
- **Key by `tenantId` + `userId` + `id`.** Never by `threadId`. A row without
  `userId` is the tenant's shared key, which every user of that tenant reads.
  A scope with neither is one bucket shared by everyone: derive the scope from
  your server-side auth, never from the request body.
- **`list` returns ids and types only.** Never a secret, not even masked.
- **Hard delete.** `delete` removes the row. No soft delete, no audit copy of
  the value. Keep secrets out of backups you cannot purge, or encrypt them with
  a key you can rotate.
- **Never log a credential.** Not in query logs, error messages, or traces.

**The persistence stores can hold secrets too:**

- `log`, the input lane: when another host owns the thread, a user's answer
  to a secret question (a pasted key) does not go into the offer. The host
  keeps the value in the `credentials` store under a one-time
  `harness:answer:*` key, and the offer has only a reference to it. The log
  records keep the answer as `[secret]`.
- `log`: never put a key in a message, tool input, or metadata.
  The harness scrubs known secrets from the errors it sends, but it cannot
  scrub what it never saw as a secret.
