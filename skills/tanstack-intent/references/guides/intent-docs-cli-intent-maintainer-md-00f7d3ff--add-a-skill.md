# Intent Maintainer — Add a skill

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Add a skill

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer add retries --package packages/client --domain requests --description "Use when configuring retries with this client." --source "src/retry.ts"

<!-- ::end:tabs -->

`--package` is repository-relative. When you omit it, the command registers the skill with the workspace member that owns the current directory; run it from the repository root, or pass `--package`, for a standalone package or a repository-owned discovery skill. The default path is `skills/<name>/SKILL.md` within that package. Use `--path <package-relative-path>/SKILL.md` for an established layout. Repeat `--source` and `--requires` to supply multiple paths or prerequisites.

Repeat `--task <text>` to record the developer tasks the skill covers in `domain_map.yaml` at registration. Without it, `maintainer status` and `maintainer check` report that the domain map still needs those tasks until you add them.

To register existing guidance, supply its name, domain, package, and path. The command reads its frontmatter and preserves the file. To change an already registered skill, edit its guidance and run `maintainer sync`.

A tree entry's `path` is relative to its `package`. When a hand-written entry repeats the package directory in `path`, such as `package: packages/client` with `path: packages/client/skills/query/SKILL.md`, `maintainer status` lists `skill_tree.yaml` as a file to synchronize and `maintainer sync` rewrites the path as `skills/query/SKILL.md`.

Registration updates the tree and domain map and appends an entry to the spec. The command prints every file it wrote. Write the task coverage, source-backed guidance, and consequential decisions; the command does not infer them.
