# Intent Review — Quick start

[Guide and prerequisites](./intent-docs-cli-intent-review-md-9cfadc0a.md) · Release-matched documentation · `@tanstack/intent@0.5.4`.

## Quick start

1. Run `intent review` from your library repository to see pending work.
2. Ask your agent to review those items using the current source change. It updates the skills and planning record, then runs the relevant checks.
3. Keep the resulting `.intent/review-state.json` with the source, skills, and planning documents in your change.
4. Run `intent review --check` to confirm that no unreviewed items remain.

A justified no-op is a completed review. Missing evidence remains pending.
