# Ai Sandbox

<a id="source-tanstack-ai-sandbox"></a>

Published skill · `@tanstack/ai-sandbox@0.5.7`.

[Topic index](../code-execution.md) · [Source provenance](../SOURCES.md)

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-ai-sandbox-c1c16d85--overview.md) — 1 KiB
- [Setup — Claude Code in a Docker sandbox](./tanstack-ai-sandbox-c1c16d85--setup-claude-code-in-a-docker-sandbox.md) — 2 KiB
- [Type-safe secrets](./tanstack-ai-sandbox-c1c16d85--type-safe-secrets.md) — 1 KiB
- [Declarative provisioning (skills, plugins, MCP, instructions)](./tanstack-ai-sandbox-c1c16d85--declarative-provisioning-skills-plugins-mcp-instructions.md) — 2 KiB
- [Fast init](./tanstack-ai-sandbox-c1c16d85--fast-init.md) — 7 KiB
- [Providers](./tanstack-ai-sandbox-c1c16d85--providers.md) — 2 KiB
- [Policy](./tanstack-ai-sandbox-c1c16d85--policy.md) — 1 KiB
- [Lifecycle &amp; resume](./tanstack-ai-sandbox-c1c16d85--lifecycle-amp-resume.md) — 1 KiB
- [Instance durability (durable resume)](./tanstack-ai-sandbox-c1c16d85--instance-durability-durable-resume.md) — 2 KiB
- [File-event hooks](./tanstack-ai-sandbox-c1c16d85--file-event-hooks.md) — 4 KiB
- [Edge / serverless execution](./tanstack-ai-sandbox-c1c16d85--edge-serverless-execution.md) — 7 KiB
- [Durable runs (the run journal)](./tanstack-ai-sandbox-c1c16d85--durable-runs-the-run-journal.md) — 7 KiB
- [Takeover: detached runs and single-writer safety](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety.md) — 1 KiB
- [Takeover: detached runs and single-writer safety: Durability is ONE opt-in, not two](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-durability-is-one-opt-in-not-two.md) — 2 KiB
- [Takeover: detached runs and single-writer safety: Detach vs cancel — intent NEVER comes from the disconnect](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-detach-vs-cancel-intent-never-comes-from-the-disconnect.md) — 3 KiB
- [Takeover: detached runs and single-writer safety: `sandboxRunDriver` — the supported way to drive a resumed run](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-sandboxrundriver-the-supported-way-to-drive-a-resumed-run.md) — 5 KiB
- [Takeover: detached runs and single-writer safety: Single-writer safety: BOTH seams are fenced](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-single-writer-safety-both-seams-are-fenced.md) — 3 KiB
- [Takeover: detached runs and single-writer safety: Replay from zero, and `JournalReplayDivergedError`](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-replay-from-zero-and-journalreplaydivergederror.md) — 3 KiB
- [Takeover: detached runs and single-writer safety: A real `LockStore` is required](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-a-real-lockstore-is-required.md) — 2 KiB
- [Takeover: detached runs and single-writer safety: The reaper ships as a function, not a scheduler](./tanstack-ai-sandbox-c1c16d85--takeover-detached-runs-and-single-writer-safety-the-reaper-ships-as-a-function-not-a-scheduler.md) — 5 KiB
- [Events](./tanstack-ai-sandbox-c1c16d85--events.md) — 1 KiB
- [Critical rules](./tanstack-ai-sandbox-c1c16d85--critical-rules.md) — 3 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="sandboxes"></a>
<a id="setup-claude-code-in-a-docker-sandbox"></a>
<a id="type-safe-secrets"></a>
<a id="declarative-provisioning-skills-plugins-mcp-instructions"></a>
<a id="fast-init"></a>
<a id="shallow-clone-depth"></a>
<a id="serial-parallel-setup-callback"></a>
<a id="snapshot-after-setup-and-snapshotmaxage"></a>
<a id="portable-sandbox-snapshots"></a>
<a id="providers"></a>
<a id="policy"></a>
<a id="lifecycle-amp-resume"></a>
<a id="instance-durability-durable-resume"></a>
<a id="file-event-hooks"></a>
<a id="edge-serverless-execution"></a>
<a id="durable-runs-the-run-journal"></a>
<a id="reading-strategy"></a>
<a id="alignment-replaying-without-duplicating"></a>
<a id="cleanup"></a>
<a id="takeover-detached-runs-and-single-writer-safety"></a>
<a id="durability-is-one-opt-in-not-two"></a>
<a id="detach-vs-cancel-intent-never-comes-from-the-disconnect"></a>
<a id="sandboxrundriver-the-supported-way-to-drive-a-resumed-run"></a>
<a id="single-writer-safety-both-seams-are-fenced"></a>
<a id="replay-from-zero-and-journalreplaydivergederror"></a>
<a id="a-real-lockstore-is-required"></a>
<a id="the-reaper-ships-as-a-function-not-a-scheduler"></a>
<a id="events"></a>
<a id="critical-rules"></a>
