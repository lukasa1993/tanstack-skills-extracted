# Production Pipelines — Performance and Cache Checks

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Performance and Cache Checks

### Check: Parse once with final options

Expected:

```ts
import type { MarkdownDocument } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const cache = new Map<string, MarkdownDocument>()

export function renderCachedArticle(key: string, source: string): string {
  const cacheKey = `markdown-0.0.15:${key}`
  let document = cache.get(cacheKey)
  if (!document) {
    document = parseMarkdown(source, {
      frontmatter: true,
      headingIds: true,
    })
    cache.set(cacheKey, document)
  }
  return renderHtml(document)
}
```

Fail condition: Stable content is reparsed per request, or parser options/extensions change after the AST is cached.

Fix: Build the AST with final parse options, version persisted cache keys, invalidate stored ASTs when node contracts change, and use only narrow entry points.

### Check: Enforce bundle budgets

Expected:

```bash
pnpm run size
pnpm test -- tests/bundle-size.test.ts
```

Fail condition: Any measured entry exceeds its checked gzip budget or starts bundling a highlighter.

Fix: Inspect the bundle diff and justify any syntax or dependency cost before adjusting a budget.
