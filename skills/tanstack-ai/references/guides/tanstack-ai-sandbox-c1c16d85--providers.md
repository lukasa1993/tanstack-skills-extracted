# Ai Sandbox — Providers

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@1.0.0`.

## Providers

- `localProcessSandbox()` — runs on the host (no isolation; dev loop only).
- `dockerSandbox({ image })` — isolated container; snapshots, fork, resume-by-id.
- `daytonaSandbox({ apiKey, snapshot, autoStopInterval, ephemeral })` —
  Daytona cloud sandbox; snapshots after setup; resume starts stopped or
  archived sandboxes. `/workspace` maps to `/home/daytona/workspace`. Setup
  that installs packages must use `sudo -n` (do not deny `sudo *`). See
  `docs/sandbox/providers.md` for network and secret injection details.

All implement the same `SandboxHandle`: `fs` (read/write/list/mkdir/remove/
rename/exists), `git` (clone/status/add/commit/push/pull/branch), `process`
(`exec` + duplex `spawn`), `ports.connect(port)`, `env.set`, optional
`snapshot()`/`fork()`, `destroy()`. Providers advertise support via
`capabilities()`; calling an unsupported optional method throws
`UnsupportedCapabilityError`.

For computer use (the model clicks and types on a Linux desktop), pass any of
these providers to `sandboxComputer({ provider })` from
`@tanstack/ai-computer-sandbox`. The image needs `xdotool`, `xdpyinfo`, and
`scrot` (or ImageMagick). The E2B `desktop` template has them. See
`docs/computer-use/drivers.md`.
