# Production Pipelines — Trust Boundary Checks

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Trust Boundary Checks

### Check: Classify every Markdown source

Expected:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderUntrustedMarkdown(
  source: string,
  sanitize: (html: string) => string,
): string {
  const rendered = renderHtml(source)
  return sanitize(rendered)
}
```

Fail condition: Untrusted input reaches `allowHtml`, an unaudited extension `renderHtml` hook, or an unaudited highlighter.

Fix: Separate trusted and untrusted entry points, keep trusted callbacks disabled for untrusted content, and enforce application link, image, and final-HTML policy.
