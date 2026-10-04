# Intent Maintainer — Overview

[Guide and prerequisites](./intent-docs-cli-intent-maintainer-md-00f7d3ff.md) · Release-matched documentation · `@tanstack/intent@0.5.3`.

`intent maintainer` provides one command workflow for creating, maintaining, and distributing library skills. Skills stay in their owning packages. The commands keep registrations and generated metadata consistent; maintainers and coding agents supply the task knowledge and review conclusions.

`intent maintainer --help` lists the actions in the order a maintainer runs them, each with a one-line summary and a `Writes:` line naming the files it changes. `intent maintainer <action> --help` prints only that action's usage and options.
