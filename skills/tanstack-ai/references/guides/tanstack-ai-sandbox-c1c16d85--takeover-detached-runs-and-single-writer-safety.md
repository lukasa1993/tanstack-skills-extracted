# Ai Sandbox — Takeover: detached runs and single-writer safety

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.7`.

## Takeover: detached runs and single-writer safety

A tab does not last ten minutes; a sandboxed coding agent does. Without
durability wired, `withSandbox`'s abort path destroys the sandbox on **every**
abort, deliberately — closing the agent's IO stream does not kill the agent
process (a Docker `exec` survives its client), so destroying the container is
the only reliable way to stop it burning tokens. Correct for a cancel, ruinous
for a refresh.
