# Intent Maintainer — Choose repository distribution

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Choose repository distribution

Package skills can also be offered through GitHub installers and native plugins. Select the registered skills explicitly:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer setup --distribution repo --repository owner/library --skill discover-library --skill retries

<!-- ::end:tabs -->

The repository is inferred from package metadata when available. `--plugin-name <name>` can choose the initial plugin name. New skills are never added to the selection automatically, and local prerequisites must be selected explicitly.

Each `--skill` must name a registered tree entry whose `SKILL.md` exists; `planned` and `retired` entries are rejected. On a brand-new library, register and author the skills first, then run this command. Until then, record `--distribution none` or leave the choice unrecorded. When the repository, plugin name, or skill selection cannot be resolved, the command reports every missing input in one error.

To keep the package distribution workflow without generating repository exports:

<!-- ::start:tabs variant="package-manager" mode="local-install" -->

@tanstack/intent@latest maintainer setup --distribution none

<!-- ::end:tabs -->

Setup remembers this choice. Package-only distribution is the default, so an unrecorded choice does not block `maintainer check`. Select repository exports only when you want that additional installation route.

After authoring, `maintainer sync` updates Claude and Cursor plugin manifests and marketplace entries that point to the existing skill directories. It preserves unrelated plugin fields and other marketplace entries. It writes `.intent/skill-distribution.json` with source paths and install arguments, and prints commands consumers can copy. Sync refuses to generate exports while a selected skill still carries the `intent:needs-authoring` marker. Conflicting plugin identities or source roots require resolution before synchronization writes anything.

An existing Claude marketplace entry with `strict: false` conflicts with the generated component manifest. Sync rejects it before writing. Keep the existing policy until the maintainer decides to use `strict: true` or omit the field.

Opting out after exports exist clears the selected paths and Intent's marketplace entry on the next sync. Other plugin features and source skills remain. This does not revoke installed copies or hide public GitHub files.

### Consumer choices

- Use the generated `npx skills add owner/library --full-depth --skill <names>` command for a selected set, or `gh skill add owner/library <exact-SKILL.md-path>` for an individual skill. Full-depth discovery finds package skills even when the repository has root or agent-directory skills; the named selection still limits what is installed.
- Install the generated marketplace through Claude Code or Cursor's native plugin flow.
- Install the npm package and use Intent's existing `list`, `install`, and `load` commands for its bundled version of the guidance.

Repository location and installation scope are separate choices. The skill installers default to project scope; consumers can explicitly choose user scope with `--global` for `skills` or `--scope user` for `gh`. Third-party tools retain their own discovery behavior: a full scan or `--all` may expose other public skills. Use the generated selection or exact paths for a curated subset.

A discovery skill can help someone decide whether a library fits before they install it. Keep that guidance about supported tasks and setup choices, respect the project's chosen stack, and hand API implementation to the installed package's skills and source. Avoid maintaining another copy of version-sensitive API instructions in the discovery skill.

### Releases and updates

Generated commands do not pin a revision or match the application's installed dependency versions. Each installer resolves its own default source. For a specific release, add `--pin <tag-or-sha>` to the generated GitHub command, use `https://github.com/owner/library/tree/<ref>` as the `skills add` source, or add a Claude marketplace from `owner/library@<tag>`. Verify that the selected paths exist at that revision.

Intent preserves existing plugin version fields. Claude uses an explicit plugin version to decide whether an update is available: bump the authoritative plugin version when releasing changed content. Without a version in either the plugin or its marketplace entry, Git-based Claude installs use the source commit. Updating an npm package version alone does not update plugin metadata.

Publish through the library's normal release process. Repository exports do not submit marketplace listings, publish releases, or update consumer installations. State the supported package versions in implementation skills and check them against the consumer's dependencies. Consumers manage updates and removal through their chosen installer.
