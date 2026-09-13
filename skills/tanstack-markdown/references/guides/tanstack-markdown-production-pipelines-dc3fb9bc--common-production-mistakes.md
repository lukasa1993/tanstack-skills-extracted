# Production Pipelines — Common Production Mistakes

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Common Production Mistakes

### CRITICAL Enabling HTML for untrusted Markdown

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderComment(source: string): string {
  return renderHtml(source, { allowHtml: true })
}
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderComment(source: string): string {
  return renderHtml(source)
}
```

`allowHtml` emits raw nodes and is not a sanitization step.

Source: `docs/core-concepts/security.md`

### HIGH Returning highlighter containers

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

function escapeCode(code: string): string {
  return code.replace(/[&<>]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  })[character] ?? character)
}

console.log(renderHtml('```ts\nconst x = 1\n```', {
  highlighter: (code) => `<pre><code>${escapeCode(code)}</code></pre>`,
}))
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

function escapeCode(code: string): string {
  return code.replace(/[&<>]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  })[character] ?? character)
}

console.log(renderHtml('```ts\nconst x = 1\n```', {
  highlighter: (code) => `<span class="token">${escapeCode(code)}</span>`,
}))
```

The renderer owns `<pre><code>`; the callback supplies only the code element's trusted contents.

Source: `docs/guides/syntax-highlighting.md`

### CRITICAL Trusting arbitrary highlighter output

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

const source = '```html\n<img src=x onerror=alert(1)>\n```'
console.log(renderHtml(source, { highlighter: (code) => code }))
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

function escapeCode(code: string): string {
  return code.replace(/[&<>]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  })[character] ?? character)
}

const source = '```html\n<img src=x onerror=alert(1)>\n```'
console.log(renderHtml(source, { highlighter: escapeCode }))
```

Highlighter output is inserted without further escaping in every renderer.

Source: `docs/core-concepts/security.md`

### MEDIUM Bundling highlighting into static clients

Wrong:

```tsx
import { Markdown } from '@tanstack/markdown/react'
import { tokenize } from '@tanstack/highlight'

export function Article({ source }: { source: string }) {
  return <Markdown highlighter={(code) => String(tokenize(code))}>{source}</Markdown>
}
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import type { CodeHighlighter } from '@tanstack/markdown'

export function renderStaticArticle(
  source: string,
  highlighter: CodeHighlighter,
): string {
  return renderHtml(source, { highlighter })
}
```

Tokenizer runtimes, grammars, and themes can outweigh Markdown parsing and should remain build-time or server-side for static content.

Source: `docs/guides/performance.md`

### CRITICAL Treating defaults as a sanitizer

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderForEveryPolicy(source: string): string {
  return renderHtml(source)
}
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderWithPolicy(
  source: string,
  sanitize: (html: string) => string,
): string {
  return sanitize(renderHtml(source))
}
```

Core escaping and protocol filtering do not enforce application-specific outbound-link, image, or final-HTML policy.

For parsed Markdown destinations, `urlTransform(url, kind, defaultUrl)` can return
the screened default, a trusted replacement, or `null` to remove the link or image
while retaining its label content. Only allow data images after application validation
of their content, MIME type, and size. Keep the default policy for other destinations.
Callback results are not screened again, and the callback does not apply to raw HTML,
extension-created URLs, or ASTs supplied directly to renderers. Do not enable raw HTML
to allow images. Include URL-policy changes in persisted AST cache invalidation.

Source: `docs/core-concepts/security.md`

### HIGH Assuming complete CommonMark behavior

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderArbitraryMarkdown(source: string): string {
  return renderHtml(source)
}
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderControlledDocs(source: string): string {
  return renderHtml(source)
}
```

The package implements a documented docs/blog profile, not complete CommonMark, GFM, MDX, or arbitrary plugin behavior.

Source: `docs/core-concepts/syntax-profile.md`

### MEDIUM Reparsing unchanged content

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

export function renderRequest(source: string): string {
  return renderHtml(source)
}
```

Correct:

```ts
import type { MarkdownDocument } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

export function compile(source: string): MarkdownDocument {
  return parseMarkdown(source)
}

export function renderRequest(document: MarkdownDocument): string {
  return renderHtml(document)
}
```

String render inputs parse the complete document, while a cached `MarkdownDocument` skips that work.

Source: `docs/core-concepts/document-model.md`

### HIGH Injecting HTML into React

Wrong:

```tsx
import { renderHtml } from '@tanstack/markdown/html'

export function Article({ source }: { source: string }) {
  const html = renderHtml(source)
  return <article dangerouslySetInnerHTML={{ __html: html }} />
}
```

Correct:

```tsx
import { Markdown } from '@tanstack/markdown/react'

export function Article({ source }: { source: string }) {
  return <article><Markdown>{source}</Markdown></article>
}
```

The HTML string adds a trusted insertion boundary and bypasses React component replacement.

Source: `docs/guides/react.md`

### MEDIUM Expecting fence metadata to highlight

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

const source = '```ts {1}\nconst answer = 42\n```'
console.log(renderHtml(source))
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

function escapeCode(code: string): string {
  return code.replace(/[&<>]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  })[character] ?? character)
}

const source = '```ts {1}\nconst answer = 42\n```'
console.log(renderHtml(source, { highlighter: escapeCode }))
```

Fence metadata enters the AST, but token markup requires an external highlighter.

Source: `docs/core-concepts/syntax-profile.md`
