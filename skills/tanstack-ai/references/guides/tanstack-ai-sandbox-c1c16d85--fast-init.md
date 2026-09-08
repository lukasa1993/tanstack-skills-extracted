# Ai Sandbox — Fast init

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Fast init

### Shallow clone (`depth`)

`githubRepo` / `gitSource` default to `--depth 1 --single-branch`. Override:

```typescript
import { githubRepo, defineWorkspace } from '@tanstack/ai-sandbox'

defineWorkspace({ source: githubRepo({ repo: 'owner/app' }) }) // depth 1 (default)
defineWorkspace({ source: githubRepo({ repo: 'owner/app', depth: 10 }) }) // 10 commits
defineWorkspace({ source: githubRepo({ repo: 'owner/app', depth: 'full' }) }) // full history
```

### Serial / parallel `setup` callback

`setup` accepts a plain `Array<string>` (all serial) or a callback that records
serial and parallel groups over a **persistent shell** whose cwd/env carry over
between serial steps:

```typescript
defineWorkspace({
  source: githubRepo({ repo: 'owner/app' }),
  setup: ({ serial, parallel }) => {
    serial('corepack enable')
    serial('pnpm install')
    parallel(['pnpm build', 'pnpm typecheck']) // concurrent; inherit cwd+env from shell
    serial('echo done')
  },
})
```

### Snapshot-after-setup and `snapshotMaxAge`

When the provider supports snapshots, bootstrap takes one automatically after
`setup` completes. Subsequent runs resume from the snapshot (skipping setup).
Override or add a TTL:

```typescript
lifecycle: {
  snapshot: 'after-setup', // default when provider.capabilities().snapshots
  snapshotMaxAge: '24h',   // re-create when the snapshot is older than this
}
```

Providers without snapshot support skip the step silently.

### Portable sandbox snapshots

Portable snapshots keep completed workspace files in application persistence.
They are separate from provider-native bootstrap snapshots. Configure the
middleware in this order, with the same persistence value in both places:

```typescript
import { withPersistence } from '@tanstack/ai-persistence'
import { memorySandboxSnapshots, withSandbox } from '@tanstack/ai-sandbox'

const snapshots = await memorySandboxSnapshots({ sandbox, instances })

const middleware = [
  withPersistence(snapshots.persistence),
  withSandbox(sandbox, { instances, snapshots }),
]
```

Each successful terminal run saves regular files, empty directories, durable
conversation data, and persisted thread artifacts. A later run restores the
latest checkpoint only into a new private sandbox. A live resumed sandbox is
never overwritten. The default policy excludes `.git`, `node_modules`, and
`.env*` path segments at every depth. It excludes the exact projection marker
only at the workspace root. It also excludes root `CLAUDE.md` and `GEMINI.md`,
plus direct `.claude/skills/<name>`, `.codex/skills/<name>`, and
`.grok/skills/<name>` paths. These exclusions use paths even for regular files
or copies. If you pass only `include` or only `redact`, the default
exclusions stay in place. If you pass `exclude`, that function replaces
the default exclusions, except for exact projection-marker protection.
Copy `defaultSandboxSnapshotPolicy()` first when you write `exclude`.
Pass `include` and `exclude` functions on `policy` to store only some files,
including one file. There is no `save({ files })` list. See
`docs/sandbox/portable-snapshots-files.md`. Resolved secrets are redacted before the data is stored. Symlinks,
executables, and special filesystem entries fail the capture or restore. Each
thread has one writer lease. Pause and detach release the lease without a
partial checkpoint. Blob retention is manual because there is no automatic
garbage collection yet.

Read these pages for the server-only setup:

- `docs/sandbox/portable-snapshots.md`
- `docs/sandbox/portable-snapshots-configure.md`
- `docs/sandbox/portable-snapshots-save.md`
- `docs/sandbox/portable-snapshots-fork.md`
- `docs/sandbox/portable-snapshots-artifacts.md`
- `docs/sandbox/portable-snapshots-tools.md`
- `docs/sandbox/portable-snapshots-files.md`
- `docs/sandbox/portable-snapshots-safety.md`

For a user-marked workspace state, call `snapshots.save` on the server. Bind
`sandbox` and `instances` at create time, or pass them on `save`. The call
needs `threadId`, `runId`, and a label. It requires a live reusable sandbox.
`reuse: 'none'` cannot save a named checkpoint.

To branch from a selected checkpoint, call `snapshots.fork` with the thread id,
checkpoint id, and destination thread id. The store must implement atomic
`forkFromCheckpoint`. The destination thread must be empty. A fork copies the
selected snapshot, not the latest snapshot.

To send a checkpoint artifact, call `snapshots.readArtifact` on the server.
First authorize the caller for the supplied thread. The method makes sure that
the checkpoint belongs to that thread, then returns its metadata and bytes. It
does not authorize a caller or create an HTTP response.

For a SQLite checkpoint store, use one transaction for a checkpoint write, its
head update, and every blob reference update. Use one transaction for a fork,
including its copied conversation. A partial transaction breaks snapshot
consistency.

Snapshot capture supports regular files and empty directories only. It excludes
`.git`, `node_modules`, and `.env*` path segments at every depth. It excludes
the exact projection marker only at the workspace root. It also excludes root
`CLAUDE.md` and `GEMINI.md`, plus direct `.claude/skills/<name>`,
`.codex/skills/<name>`, and `.grok/skills/<name>` paths. These exclusions use
paths even for regular files or copies. If you pass only `include` or only
`redact`, the default exclusions stay in place. If you pass `exclude`, that
function replaces the default exclusions, except for exact projection-marker
protection. It rejects symlinks, executable files, and special filesystem
entries. Restore verifies the manifest and blobs before
it changes a new private sandbox. It never writes into a live resumed sandbox.
