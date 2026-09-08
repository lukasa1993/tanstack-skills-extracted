# Middleware — Sandbox File-Event Hooks (`sandbox` group)

[Guide and prerequisites](./tanstack-ai-core-middleware-b87affa9.md) · Published skill · `@tanstack/ai@0.53.0`.

## Sandbox File-Event Hooks (`sandbox` group)

Declare a `sandbox: ChatSandboxHooks` group on `defineChatMiddleware` to react
to every file created/changed/deleted inside a sandbox provided by
`withSandbox` (from `@tanstack/ai-sandbox`). These fire **per-run**,
server-side, and each handler receives the run's `ChatMiddlewareContext` as
the first argument:

```typescript
import { defineChatMiddleware } from '@tanstack/ai'
import { db } from './db'

const auditMiddleware = defineChatMiddleware({
  name: 'audit',
  sandbox: {
    onFile: (ctx, e) => console.log(ctx.runId, e.type, e.path),
    onFileCreate: (ctx, e) => db.log({ run: ctx.runId, event: e }),
  },
})
```

| Hook           | Fires for                  |
| -------------- | -------------------------- |
| `onFile`       | Every create/change/delete |
| `onFileCreate` | File creates only          |
| `onFileChange` | File changes only          |
| `onFileDelete` | File deletes only          |

These are independent of the stream: the engine also emits a `sandbox.file`
`CUSTOM` chunk per change regardless of whether any `sandbox` hooks are
registered, so a client can react to the same edits without middleware. See
`./tanstack-ai-core-ag-ui-protocol-5877d289.md#source-tanstack-ai-core-ag-ui-protocol` for reading that chunk (and the opt-in
`sandbox.file.diff` chunk) off `ChatStream`.

### `before()` / `after()` / `diff()` — lazy, git-backed content accessors

Each hook receives a `SandboxFileHookEvent`: the serializable
`{ type, path, timestamp }` plus three lazy accessors for the file's content:

```ts
interface SandboxFileHookEvent {
  type: 'create' | 'change' | 'delete'
  path: string
  timestamp: number
  before(): Promise<string> // content at the session baseline ('' if new / non-git)
  after(): Promise<string> // current content ('' if deleted)
  diff(): Promise<string> // unified patch vs the baseline
}
```

```typescript
import { defineChatMiddleware } from '@tanstack/ai'
import { db } from './db'

const auditMiddleware = defineChatMiddleware({
  name: 'audit',
  sandbox: {
    onFileChange: async (ctx, e) => {
      const [before, after] = await Promise.all([e.before(), e.after()])
      db.log({ run: ctx.runId, path: e.path, before, after })
    },
  },
})
```

**Lazy — path-only hooks pay nothing.** `before()`, `after()`, and `diff()`
are methods, not fields: each only reads the file or shells out to `git` when
called. A hook that only reads `e.path`/`e.type` (like the `onFile` logger
above) never touches the filesystem or spawns a process.

**Git session baseline.** The sandbox snapshots `git rev-parse HEAD` once at
setup as the session baseline (empty string if the workspace isn't a git repo
or has no commits). `before()` and `diff()` always diff against that same
fixed baseline for the rest of the run, so `onFileChange` reports the file's
**cumulative** change since the run started, not just the delta since the
last poll. `after()` always reads current on-disk content. None of the three
accessors throw: a deleted file resolves `after()` to `''` (it still has
`before()`); a new file resolves `before()` to `''` (it still has `after()`);
a non-git workspace resolves **both** `before()` and `after()` to `''` and
makes `diff()` fall back to a synthesized add-patch built from `after()` —
except for a `delete` event in a non-git workspace, where there's nothing to
synthesize and `diff()` resolves to `''`. In a git workspace a file git
**isn't tracking yet** (a file the agent created, and every later edit to it)
diffs empty because `git diff` ignores untracked files, so `diff()` falls
back to the same synthesized add-patch whenever the file is absent at the
baseline — a create-or-edit of an untracked file never streams an empty diff.
An empty diff for a **tracked** file (identical to the baseline) stays empty,
as it should. A **git-ignored** file is withheld: the file event still fires
(you're notified it changed) but `diff()` returns `''`, so a secret like a
`.env` never has its contents surfaced in the diff feed.

**Failures are logged, not silent.** Every git/exec/fs failure behind these
accessors (and behind the `find`-poll watcher) still falls back to `''`/an
empty snapshot, but logs first: real anomalies (a failed `git diff`, an
unreadable file, a lost `find` poll) under the `errors` category (on by
default); expected-empty conditions (a new file's `before()`, a non-git
baseline) under the `sandbox` debug category.

**Hook errors are swallowed per hook.** A throwing `sandbox` hook is caught
and logged under the `errors` category (on by default) — it cannot break the
run or stop other hooks (or the `sandbox.file` chunk) from continuing.

Source: docs/sandbox/observability.md
