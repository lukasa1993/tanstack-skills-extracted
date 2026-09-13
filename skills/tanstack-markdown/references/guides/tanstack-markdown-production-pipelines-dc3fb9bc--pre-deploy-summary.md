# Production Pipelines — Pre-Deploy Summary

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Pre-Deploy Summary

- [ ] Every content source is classified as trusted or untrusted.
- [ ] Raw HTML, extension HTML, and highlighter output have explicit owners.
- [ ] Application link, image, and final-sanitization policies are enforced.
- [ ] The downstream corpus passes deterministic AST and renderer checks.
- [ ] Unsupported syntax is documented rather than silently assumed.
- [ ] Stable content is parsed once with final options and versioned cache keys.
- [ ] Highlighting runs at build time or on the server where possible.
- [ ] Narrow entry points and individual extensions are used.
- [ ] Bundle budgets and HTML/React/Octane parity tests pass.
- [ ] `pnpm run verify` passes before release.
