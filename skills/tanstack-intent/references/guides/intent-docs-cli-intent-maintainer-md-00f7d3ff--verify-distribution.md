# Intent Maintainer — Verify distribution

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.3`.

## Verify distribution

Before releasing a library's exports, install the selected skills in disposable consumer projects through every advertised route. Check the installed names, bundled references and scripts, supported package versions, update behavior, and removal. Opting out in the source repository must not be described as removing consumer copies.

Use each host's native plugin flow, including [Cursor](https://cursor.com/docs/reference/plugins). Inspect all loaded components: the repository root becomes the plugin root, so preserved or automatically discovered commands, agents, hooks, and MCP configuration are not limited by the skill selection. Run a real consumer task; valid metadata does not establish correct guidance.

When changing Intent's distribution implementation, run the [contributor compatibility gate](https://github.com/TanStack/intent/blob/9e6e5ed8e03ae0f3e0be71cd764c9afb96aec67d/CONTRIBUTING.md#distribution-compatibility). That guide owns the required tools, verified versions, and automated checks.

Cursor acceptance and agent task quality remain separate checks. Record an unavailable host or missing task evidence as incomplete, even when the automated gate passes.
