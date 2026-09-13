# Production Pipelines — Highlighting Checks

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Highlighting Checks

### Check: Return trusted code contents only

Expected:
```ts
import { renderHtml } from '@tanstack/markdown/html'
import { createHighlighter } from '@tanstack/highlight/core'
import { plaintext } from '@tanstack/highlight/languages/plaintext'
import { ts } from '@tanstack/highlight/languages/ts'
import { createTanStackMarkdownHighlighter } from '@tanstack/highlight/markdown'
const highlighter = createHighlighter({ languages: [plaintext, ts] })
export const html = renderHtml('```ts {1}\nconst answer = 42\n```', {
  highlighter: createTanStackMarkdownHighlighter(highlighter),
})
```

Fail condition: The callback returns a complete `<pre><code>` tree, does not escape source code, or comes from an unreviewed transform.

Fix: Return only escaped markup for the renderer-owned `<code>` contents, and run highlighting during ingestion, build, or server rendering.
