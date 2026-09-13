# Production Pipelines — Compatibility Checks

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Compatibility Checks

### Check: Validate the actual content corpus

Expected:

```bash
MARKDOWN_CORPUS_DIRS=../site/src/blog:../site/docs pnpm run test:corpus
pnpm run corpus:audit:tanstack
pnpm run corpus:audit:external
```

Fail condition: Adoption relies only on CommonMark examples or a comparison table instead of the site's Markdown.

Fix: Add downstream content directories, preserve practical regressions with focused fixtures, and require renderer and bundle accounting for new syntax.

### Check: Verify deterministic output

Expected:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const source = '# Deterministic\n\n- one\n- two'
const firstDocument = JSON.stringify(parseMarkdown(source))
const secondDocument = JSON.stringify(parseMarkdown(source))
const firstHtml = renderHtml(source)
const secondHtml = renderHtml(source)

if (firstDocument !== secondDocument || firstHtml !== secondHtml) {
  throw new Error('Markdown output is nondeterministic')
}
```

Fail condition: Identical source and options produce different serialized AST or HTML.

Fix: Remove time, randomness, environment state, and unstable ordering from extensions and render callbacks.
