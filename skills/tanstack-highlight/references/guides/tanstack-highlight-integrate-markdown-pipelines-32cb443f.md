# Integrate Markdown Pipelines

<a id="source-tanstack-highlight-integrate-markdown-pipelines"></a>

Published skill · `@tanstack/highlight@0.1.0`.

[Topic index](../integrations.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Configure Selective Highlighting](./tanstack-highlight-configure-selective-highlighting-aee9011b.md).

This skill builds on `configure-selective-highlighting`. Read it first for registry and bundle behavior.

# Integrate Markdown Pipelines

## Setup

Connect TanStack Markdown without duplicating its `<pre><code>` wrapper:

```ts
import { createTanStackMarkdownHighlighter } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const highlightMarkdownCode =
  createTanStackMarkdownHighlighter(highlighter)
```

Render a parsed fence directly when the application owns Markdown traversal:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export function renderFence(code: string, lang: string, meta?: string) {
  return renderCodeFence(
    {
      code,
      lang,
      meta,
    },
    highlighter,
  )
}
```

The result includes `copyText`, `htmlMarkup`, `lang`, `title`, `tokens`, `decorations`, and `lineNumbers`.

## Core Patterns

### Theme TanStack Markdown containers

```ts
import { createThemeCss } from '@tanstack/highlight/theme'
import { githubDarkTheme } from '@tanstack/highlight/themes/github-dark'
import { githubLightTheme } from '@tanstack/highlight/themes/github-light'

export const css = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: '.markdown-renderer',
  darkSelector: '.dark .markdown-renderer',
  codeBlockSelector: '.markdown-renderer pre.tm-code',
  lineNumbersSelector: '.markdown-renderer .tm-code--line-numbers',
})
```

The adapter returns escaped inner markup. TanStack Markdown owns the outer elements and adds `tm-code--line-numbers` when requested.

### Transform MDAST before remark-rehype

```ts
import rehypeStringify from 'rehype-stringify'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { unified } from 'unified'
import { highlighter } from './highlight'

const processor = unified()
  .use(remarkParse)
  .use(remarkHighlightCodeBlocks, {
    highlighter,
    lineNumbers: true,
  })
  .use(remarkRehype)
  .use(rehypeStringify)

export async function renderMarkdown(markdown: string) {
  return String(await processor.process(markdown))
}
```

The plugin attaches structured HAST data to replacement MDAST nodes; raw HTML is not required.

### Transform existing HAST code blocks

```ts
import rehypeParse from 'rehype-parse'
import rehypeStringify from 'rehype-stringify'
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { unified } from 'unified'
import { highlighter } from './highlight'

const processor = unified()
  .use(rehypeParse, { fragment: true })
  .use(rehypeHighlightCodeBlocks, {
    highlighter,
    lineNumbers: false,
  })
  .use(rehypeStringify)

export async function highlightHtml(html: string) {
  return String(await processor.process(html))
}
```

The Rehype adapter reads `<pre><code class="language-*">` and skips blocks already marked `th-code`.

### Parse standard fence annotations

```ts
import { parseCodeFenceMeta } from '@tanstack/highlight/markdown'

export const meta = parseCodeFenceMeta(
  'title="App.tsx" {2,4-6} ins={8} error={11} lineNumbers',
)
```

Line annotations are one-based and inclusive; the parsed classes remain application-styled.

## Common Mistakes

### HIGH Confusing Markdown source with adapters

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { markdown } from '@tanstack/highlight/languages/markdown'

export const highlighter = createHighlighter({ languages: [markdown] })
```

Correct:

```ts
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export const highlightCode = remarkHighlightCodeBlocks({ highlighter })
```

The Markdown language highlights Markdown source; the adapters transform fenced blocks in a document tree.

Source: `docs/guides/markdown-pipelines.md`

### CRITICAL Running Remark after HAST conversion

Wrong:

```ts
import remarkRehype from 'remark-rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { unified } from 'unified'
import { highlighter } from './highlight'

export const processor = unified()
  .use(remarkRehype)
  .use(remarkHighlightCodeBlocks, { highlighter })
```

Correct:

```ts
import remarkRehype from 'remark-rehype'
import { remarkHighlightCodeBlocks } from '@tanstack/highlight/remark'
import { unified } from 'unified'
import { highlighter } from './highlight'

export const processor = unified()
  .use(remarkHighlightCodeBlocks, { highlighter })
  .use(remarkRehype)
```

The Remark adapter must see MDAST `code` nodes before `remark-rehype` converts the tree.

Source: `docs/guides/markdown-pipelines.md`

### HIGH Enabling raw HTML without needing it

Wrong:

```ts
import {
  remarkCodeNodeToHtml,
  type RemarkCodeNode,
} from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export function transform(node: RemarkCodeNode) {
  return remarkCodeNodeToHtml(node, { highlighter })
}
```

Correct:

```ts
import {
  remarkCodeNodeToMdast,
  type RemarkCodeNode,
} from '@tanstack/highlight/remark'
import { highlighter } from './highlight'

export function transform(node: RemarkCodeNode) {
  return remarkCodeNodeToMdast(node, { highlighter })
}
```

The structured result already carries `hName`, `hProperties`, and `hChildren`.

Source: `src/remark.ts`

### HIGH Passing an undiscoverable Rehype shape

Wrong:

```html
<code data-language="tsx">const node = &lt;Button /&gt;</code>
```

Correct:

```html
<pre><code class="language-tsx">const node = &lt;Button /&gt;</code></pre>
```

The Rehype adapter discovers a `code` child under `pre` and reads its first `language-*` class.

Source: `src/rehype.ts`

### CRITICAL Mixing exact and block-normalized APIs

Wrong:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const serverHtml = highlighter.highlightToHtml('const value = 1\n', {
  lang: 'ts',
})
export const clientHtml = renderCodeFence(
  { code: 'const value = 1\n', lang: 'ts' },
  highlighter,
).htmlMarkup
```

Correct:

```ts
import { renderCodeFence } from '@tanstack/highlight/markdown'
import { highlighter } from './highlight'

export const serverHtml = renderCodeFence(
  { code: 'const value = 1\n', lang: 'ts' },
  highlighter,
).htmlMarkup
export const clientHtml = renderCodeFence(
  { code: 'const value = 1\n', lang: 'ts' },
  highlighter,
).htmlMarkup
```

`highlight()` preserves exact input, while fence and block-data helpers trim trailing block whitespace.

Source: `docs/guides/ssr-and-client.md`

### HIGH Tension: structured output versus raw HTML

Prefer structured MDAST/HAST transforms inside Markdown pipelines. Use generated `htmlMarkup` only at an application boundary that deliberately inserts escaped highlighter output.

See also: `./tanstack-highlight-integrate-framework-code-blocks-9c88ca76.md#source-tanstack-highlight-integrate-framework-code-blocks` - direct components own their HTML insertion boundary.

### HIGH Tension: exact source versus block normalization

Use the same block-level helper on server and client. Mixing core `highlight()` with Markdown helpers changes trailing whitespace behavior.

See also: `./tanstack-highlight-integrate-framework-code-blocks-9c88ca76.md#source-tanstack-highlight-integrate-framework-code-blocks` - hydrated output must use matching inputs and options.

## References

- [Direct fences and HAST helpers](../assets/tanstack-highlight-integrate-markdown-pipelines/references/direct-fences.md)
- [Remark adapter](../assets/tanstack-highlight-integrate-markdown-pipelines/references/remark.md)
- [Rehype adapter](../assets/tanstack-highlight-integrate-markdown-pipelines/references/rehype.md)

See also: `./tanstack-highlight-theme-and-annotate-code-f5bc5628.md#source-tanstack-highlight-theme-and-annotate-code` - fence metadata maps to titles, line numbers, and decorations.
