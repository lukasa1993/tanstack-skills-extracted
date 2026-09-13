# Production Pipelines — Release Checks

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Release Checks

### Check: Run the complete package gate

Expected:

```bash
pnpm run verify
```

Fail condition: Tests, typechecking, build, docs validation, conformance accounting, sizes, benchmarks, or the npm dry run fail.

Fix: Resolve every gate before publishing, including HTML/React/Octane parity; audit raw HTML, highlighter output, HTML hooks, and component replacements separately.
