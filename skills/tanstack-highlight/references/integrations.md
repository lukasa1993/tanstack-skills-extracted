# Framework and Markdown integration

Framework code blocks and Markdown pipelines.

<a id="source-tanstack-highlight-integrate-framework-code-blocks"></a>

## Integrate Framework Code Blocks

Source: `tanstack-highlight-integrate-framework-code-blocks`.

This skill requires `configure-selective-highlighting` and `integrate-markdown-pipelines`. Read them first for registry and tree-transform behavior.

## Integrate Framework Code Blocks

### Integration Setup

Create the highlighter in an isomorphic module, then pass it into the adapter:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'

const highlighter = createHighlighter({ languages: [ts, tsx] })

export const block = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const answer = 42',
  lang: 'ts',
  title: 'answer.ts',
  className: 'docs-code',
})
```

The adapters import no React, Octane, or MDX runtime and register no languages.

### Core Integration Patterns

#### Render React-owned controls around generated markup

```tsx
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'

export function CodeBlock({
  className,
  copyText,
  htmlMarkup,
  title,
}: HighlightedCodeBlockProps) {
  return (
    <figure className={className}>
      {title ? <figcaption>{title}</figcaption> : null}
      <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
      <button
        type="button"
        onClick={() => navigator.clipboard.writeText(copyText)}
      >
        Copy
      </button>
    </figure>
  )
}
```

Copy controls, tabs, filenames, and layout remain application-owned.

#### Configure Octane MDX with a plugin tuple

```ts
import { octaneMdx } from '@octanejs/mdx/vite'
import { createOctaneMdxHighlight } from '@tanstack/highlight/octane'
import { highlighter } from './src/highlight'

export default {
  plugins: [
    octaneMdx({
      rehypePlugins: [
        createOctaneMdxHighlight({
          highlighter,
          lineNumbers: true,
        }),
      ],
    }),
  ],
}
```

The tuple wraps the synchronous Rehype adapter expected by `@octanejs/mdx`.

#### Highlight only content introduced after hydration

```ts
import { highlighter } from './highlight'

export function renderClientNavigationCode(code: string, lang: string) {
  return highlighter.renderCodeBlockData({ code, lang })
}
```

Initial server-rendered code is already static highlighted HTML; use the client registry for new routes, previews, or interactive source changes.

### Common Mistakes

#### HIGH Nesting complete markup inside code

Wrong:

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export function CodeBlock() {
  const block = createHighlightedCodeBlockProps({
    highlighter,
    code: 'const answer = 42',
    lang: 'ts',
  })

  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
    </pre>
  )
}
```

Correct:

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export function CodeBlock() {
  const block = createHighlightedCodeBlockProps({
    highlighter,
    code: 'const answer = 42',
    lang: 'ts',
  })

  return <div dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
}
```

`htmlMarkup` already contains the complete `pre > code` tree, so wrapping it creates invalid nested block markup.

Source: `docs/guides/react.md`

#### CRITICAL Inserting arbitrary HTML through block props

Wrong:

```tsx
export function UserContent({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}
```

Correct:

```tsx
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export function UserCode({ code }: { code: string }) {
  const block = createHighlightedCodeBlockProps({
    highlighter,
    code,
    lang: 'plaintext',
  })

  return <div dangerouslySetInnerHTML={{ __html: block.htmlMarkup }} />
}
```

The highlighter escapes code source; the insertion prop does not sanitize unrelated HTML.

Source: `docs/guides/react.md`

#### HIGH Rehighlighting initial DOM during hydration

Wrong:

```tsx
import { highlighter } from './highlight'
import { useEffect } from 'react'

export function HydratedCode() {
  useEffect(() => {
    document.querySelectorAll('pre code').forEach((node) => {
      const pre = node.parentElement
      const language = [...node.classList]
        .find((name) => name.startsWith('language-'))
        ?.slice('language-'.length)

      if (pre) {
        pre.outerHTML = highlighter.highlightToHtml(node.textContent || '', {
          lang: language,
        })
      }
    })
  }, [])

  return null
}
```

Correct:

```tsx
import type { HighlightedCodeBlockProps } from '@tanstack/highlight/react'

export function HydratedCode({ htmlMarkup }: HighlightedCodeBlockProps) {
  return <div dangerouslySetInnerHTML={{ __html: htmlMarkup }} />
}
```

Server-rendered highlighted HTML is static and does not need a hydration effect.

Source: `docs/guides/ssr-and-client.md`

#### HIGH Passing a bare transformer to Octane

Wrong:

```ts
import { rehypeHighlightCodeBlocks } from '@tanstack/highlight/rehype'
import { highlighter } from './src/highlight'

export const rehypePlugins = [
  rehypeHighlightCodeBlocks({ highlighter }),
]
```

Correct:

```ts
import { createOctaneMdxHighlight } from '@tanstack/highlight/octane'
import { highlighter } from './src/highlight'

export const rehypePlugins = [
  createOctaneMdxHighlight({ highlighter }),
]
```

Octane MDX consumes the plugin-and-options tuple returned by its adapter.

Source: `docs/guides/octane.md`

#### CRITICAL Diverging server and client registries

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'

const languages = typeof window === 'undefined' ? [html, js] : [html]

export const highlighter = createHighlighter({ languages })
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'

export const highlighter = createHighlighter({ languages: [html, js] })
```

Different registrations change normalized languages and embedded output during hydration.

Source: `docs/guides/ssr-and-client.md`

#### CRITICAL Mixing exact and block-normalized APIs

Wrong:

```ts
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export const serverHtml = highlighter.highlightToHtml('const value = 1\n', {
  lang: 'ts',
})
export const clientHtml = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const value = 1\n',
  lang: 'ts',
}).htmlMarkup
```

Correct:

```ts
import { createHighlightedCodeBlockProps } from '@tanstack/highlight/react'
import { highlighter } from './highlight'

export const serverHtml = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const value = 1\n',
  lang: 'ts',
}).htmlMarkup
export const clientHtml = createHighlightedCodeBlockProps({
  highlighter,
  code: 'const value = 1\n',
  lang: 'ts',
}).htmlMarkup
```

Block-data adapters trim trailing whitespace while core `highlight()` preserves it.

Source: `docs/guides/ssr-and-client.md`

#### HIGH Tension: convenience versus client size

Adapters accept an explicit highlighter so the application controls retained languages. Passing root helpers around defeats that boundary.

See also: `./languages-configuration.md#source-tanstack-highlight-configure-selective-highlighting` - build one selective isomorphic registry.

#### HIGH Tension: structured output versus raw HTML

Use structured HAST in MDX pipelines. Insert generated `htmlMarkup` only inside an application-owned direct component.

See also: `./integrations.md#source-tanstack-highlight-integrate-markdown-pipelines` - Remark and Rehype can avoid raw HTML.

#### HIGH Tension: exact source versus block normalization

Use the same adapter and options for server and client output. Theme selection does not affect markup, but source normalization does.

See also: `./integrations.md#source-tanstack-highlight-integrate-markdown-pipelines` - fence helpers share block normalization.

### References

- [React component data](./assets/tanstack-highlight-integrate-framework-code-blocks/references/react.md)
- [Octane component data](./assets/tanstack-highlight-integrate-framework-code-blocks/references/octane-components.md)
- [Octane MDX](./assets/tanstack-highlight-integrate-framework-code-blocks/references/octane-mdx.md)

See also: `./languages-configuration.md#source-tanstack-highlight-configure-selective-highlighting` - SSR and client output require the same registry and package version.

<a id="source-tanstack-highlight-integrate-markdown-pipelines"></a>

## Integrate Markdown Pipelines

Source: `tanstack-highlight-integrate-markdown-pipelines`.

This skill builds on `configure-selective-highlighting`. Read it first for registry and bundle behavior.

## Integrate Markdown Pipelines

### Setup

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

### Core Patterns

#### Theme TanStack Markdown containers

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

#### Transform MDAST before remark-rehype

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

#### Transform existing HAST code blocks

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

#### Parse standard fence annotations

```ts
import { parseCodeFenceMeta } from '@tanstack/highlight/markdown'

export const meta = parseCodeFenceMeta(
  'title="App.tsx" {2,4-6} ins={8} error={11} lineNumbers',
)
```

Line annotations are one-based and inclusive; the parsed classes remain application-styled.

### Common Mistakes

#### HIGH Confusing Markdown source with adapters

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

#### CRITICAL Running Remark after HAST conversion

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

#### HIGH Enabling raw HTML without needing it

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

#### HIGH Passing an undiscoverable Rehype shape

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

#### CRITICAL Mixing exact and block-normalized APIs

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

#### HIGH Tension: structured output versus raw HTML

Prefer structured MDAST/HAST transforms inside Markdown pipelines. Use generated `htmlMarkup` only at an application boundary that deliberately inserts escaped highlighter output.

See also: `./integrations.md#source-tanstack-highlight-integrate-framework-code-blocks` - direct components own their HTML insertion boundary.

#### HIGH Tension: exact source versus block normalization

Use the same block-level helper on server and client. Mixing core `highlight()` with Markdown helpers changes trailing whitespace behavior.

See also: `./integrations.md#source-tanstack-highlight-integrate-framework-code-blocks` - hydrated output must use matching inputs and options.

### References

- [Direct fences and HAST helpers](./assets/tanstack-highlight-integrate-markdown-pipelines/references/direct-fences.md)
- [Remark adapter](./assets/tanstack-highlight-integrate-markdown-pipelines/references/remark.md)
- [Rehype adapter](./assets/tanstack-highlight-integrate-markdown-pipelines/references/rehype.md)

See also: `./themes-annotations.md#source-tanstack-highlight-theme-and-annotate-code` - fence metadata maps to titles, line numbers, and decorations.
