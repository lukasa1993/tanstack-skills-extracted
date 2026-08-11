# Parsing and extensions

Markdown parsing, documentation features, and extensions.

<a id="source-tanstack-markdown-custom-extensions"></a>

## Custom Extensions

Source: `tanstack-markdown-custom-extensions`.

This skill builds on `render-markdown`. Read it first for parser options, the document AST, and renderer behavior.

## Custom Extensions

### Setup

Implement a bounded block parser and return a standard `ComponentNode`:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

function notesExtension(): MarkdownExtension {
  return {
    name: 'notes',
    parseBlock(context) {
      const first = context.lines[context.index] ?? ''
      const opening = first.match(/^:::note(?:\s+(.*))?$/)
      if (!opening) return undefined

      const body: string[] = []
      let cursor = context.index + 1
      while (cursor < context.lines.length && context.lines[cursor] !== ':::') {
        body.push(context.lines[cursor] ?? '')
        cursor++
      }
      if (context.lines[cursor] !== ':::') return undefined

      const title = opening[1]?.trim() || 'Note'
      context.consume(cursor - context.index + 1)
      return {
        type: 'component',
        name: 'note',
        tagName: 'docs-note',
        attributes: { title },
        properties: { 'data-title': title },
        children: context.parseBlocks(body.join('\n')),
      }
    },
  }
}

const source = `:::note Cache the AST
Parse once and render many times.
:::`
const extensions = [notesExtension()]
const document = parseMarkdown(source, { extensions })
const html = renderHtml(document, { extensions })

console.log(html)
```

`parseBlock` runs before built-in block parsing, and nested `parseBlocks` shares the parent depth budget and heading slugger.

### Core Patterns

#### Transform parsed inline nodes

```ts
import type {
  InlineNode,
  MarkdownExtension,
  StrongNode,
} from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'

const importantExtension: MarkdownExtension = {
  name: 'important-inline',
  transformInline(nodes) {
    return nodes.map((node): InlineNode => {
      if (node.type !== 'text' || !node.value.startsWith('IMPORTANT: ')) {
        return node
      }
      const strong: StrongNode = {
        type: 'strong',
        children: [{ type: 'text', value: node.value }],
      }
      return strong
    })
  },
}

const html = renderHtml('IMPORTANT: Back up the database.', {
  extensions: [importantExtension],
})

console.log(html)
```

Transforms receive built-in inline nodes and must return a deterministic replacement array.

#### Derive document metadata after parsing

```ts
import type {
  InlineNode,
  MarkdownExtension,
  MarkdownHeading,
} from '@tanstack/markdown'
import { parseMarkdown } from '@tanstack/markdown/parser'

function inlineText(nodes: InlineNode[]): string {
  return nodes
    .map((node) => {
      if (node.type === 'text' || node.type === 'inlineCode') return node.value
      if (node.type === 'image') return node.alt
      if ('children' in node) return inlineText(node.children)
      return ''
    })
    .join('')
}

const topLevelHeadings: MarkdownExtension = {
  name: 'top-level-headings',
  transformDocument(document) {
    const headings: MarkdownHeading[] = document.children.flatMap((node) =>
      node.type === 'heading' && node.id
        ? [{
            id: node.id,
            text: inlineText(node.children),
            level: node.depth,
          }]
        : [],
    )
    return { ...document, headings }
  },
}

const document = parseMarkdown('# Install\n\n## Configure', {
  extensions: [topLevelHeadings],
})

console.log(document.headings)
```

Document transforms run after blocks and footnotes are complete and may return a new document or mutate the existing one.

#### Use an HTML hook only for HTML output

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { calloutsExtension } from '@tanstack/markdown/extensions/callouts'
import { renderHtml } from '@tanstack/markdown/html'

const compactCalloutHtml: MarkdownExtension = {
  name: 'compact-callout-html',
  renderHtml(node, context) {
    if (node.type !== 'callout') return undefined
    const children = node.children.map(context.renderBlock).join('\n')
    return `<aside class="compact-callout">${children}</aside>`
  },
}

const extensions = [calloutsExtension(), compactCalloutHtml]
const html = renderHtml('> [!NOTE]\n> Cached.', { extensions })

console.log(html)
```

The returned string is trusted and HTML-specific; nested standard nodes remain escaped because they use `context.renderBlock`.

#### Emit portable custom elements

```ts
import { commentComponentsExtension } from '@tanstack/markdown/extensions/comment-components'
import { renderHtml } from '@tanstack/markdown/html'

const panels = commentComponentsExtension({
  transformComponent(node) {
    if (node.name !== 'panel') return node
    return {
      ...node,
      tagName: 'docs-panel',
      properties: {
        'data-kind': node.attributes.kind ?? 'note',
      },
    }
  },
})

const source = `<!-- ::start:panel kind="warning" -->
Check the migration before deploying.
<!-- ::end:panel -->`
const html = renderHtml(source, { extensions: [panels] })

console.log(html)
```

React and Octane can replace the emitted `docs-panel` tag through their `components` maps.

### Common Mistakes

#### HIGH Claiming a block without consuming it

Wrong:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'

const brokenNotes: MarkdownExtension = {
  name: 'broken-notes',
  parseBlock(context) {
    if (context.lines[context.index] !== ':::note') return undefined
    return {
      type: 'paragraph',
      children: context.parseInline(context.lines[context.index + 1] ?? ''),
    }
  },
}

console.log(renderHtml(':::note\nCached.\n:::', {
  extensions: [brokenNotes],
}))
```

Correct:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'

const notes: MarkdownExtension = {
  name: 'notes',
  parseBlock(context) {
    if (context.lines[context.index] !== ':::note') return undefined
    const closing = context.lines.indexOf(':::', context.index + 1)
    if (closing === -1) return undefined
    const body = context.lines.slice(context.index + 1, closing).join('\n')
    context.consume(closing - context.index + 1)
    return {
      type: 'component',
      name: 'note',
      attributes: {},
      children: context.parseBlocks(body),
    }
  },
}

console.log(renderHtml(':::note\nCached.\n:::', {
  extensions: [notes],
}))
```

Returning a node advances only one line unless `consume` records the complete owned block.

Source: `docs/guides/extensions.md`

#### HIGH Ordering a general parser first

Wrong:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { calloutsExtension } from '@tanstack/markdown/extensions/callouts'
import { renderHtml } from '@tanstack/markdown/html'

const quotedLine: MarkdownExtension = {
  name: 'quoted-line',
  parseBlock(context) {
    const match = (context.lines[context.index] ?? '').match(/^>\s?(.*)$/)
    if (!match) return undefined
    context.consume(1)
    return { type: 'paragraph', children: context.parseInline(match[1] ?? '') }
  },
}

console.log(renderHtml('> [!TIP]\n> Cache it.', {
  extensions: [quotedLine, calloutsExtension()],
}))
```

Correct:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { calloutsExtension } from '@tanstack/markdown/extensions/callouts'
import { renderHtml } from '@tanstack/markdown/html'

const quotedLine: MarkdownExtension = {
  name: 'quoted-line',
  parseBlock(context) {
    const match = (context.lines[context.index] ?? '').match(/^>\s?(.*)$/)
    if (!match) return undefined
    context.consume(1)
    return { type: 'paragraph', children: context.parseInline(match[1] ?? '') }
  },
}

console.log(renderHtml('> [!TIP]\n> Cache it.', {
  extensions: [calloutsExtension(), quotedLine],
}))
```

Extensions run in array order, so the broad quote parser can hide callout syntax from the specific parser.

Source: `docs/guides/extensions.md`

#### HIGH Using HTML hooks for framework nodes

Wrong:

```tsx
import type { MarkdownExtension } from '@tanstack/markdown'
import { Markdown } from '@tanstack/markdown/react'

const htmlOnly: MarkdownExtension = {
  name: 'html-only',
  renderHtml(node, context) {
    if (node.type !== 'paragraph') return undefined
    return `<aside>${node.children.map(context.renderInline).join('')}</aside>`
  },
}

export function Article() {
  return <Markdown extensions={[htmlOnly]}>Framework output</Markdown>
}
```

Correct:

```tsx
import { commentComponentsExtension } from '@tanstack/markdown/extensions/comment-components'
import { Markdown } from '@tanstack/markdown/react'
import type { ComponentProps } from 'react'

const components = commentComponentsExtension({
  transformComponent(node) {
    return node.name === 'panel'
      ? { ...node, tagName: 'docs-panel' }
      : node
  },
})

function Panel(props: ComponentProps<'aside'>) {
  return <aside {...props} />
}

export function Article() {
  return (
    <Markdown
      extensions={[components]}
      components={{ 'docs-panel': Panel }}
    >
      {'<!-- ::start:panel -->\nPortable output\n<!-- ::end:panel -->'}
    </Markdown>
  )
}
```

`renderHtml` hooks do not run in React or Octane; a `ComponentNode` and emitted-tag component mapping is the portable path.

Source: `docs/guides/extensions.md`

#### MEDIUM Changing extensions after parsing

Wrong:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const emphasisHtml: MarkdownExtension = {
  name: 'emphasis-html',
  renderHtml(node, context) {
    if (node.type !== 'emphasis') return undefined
    return `<i class="accent">${node.children.map(context.renderInline).join('')}</i>`
  },
}

const document = parseMarkdown('_Important_', {
  extensions: [emphasisHtml],
})
console.log(renderHtml(document))
```

Correct:

```ts
import type { MarkdownExtension } from '@tanstack/markdown'
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const emphasisHtml: MarkdownExtension = {
  name: 'emphasis-html',
  renderHtml(node, context) {
    if (node.type !== 'emphasis') return undefined
    return `<i class="accent">${node.children.map(context.renderInline).join('')}</i>`
  },
}

const extensions = [emphasisHtml]
const document = parseMarkdown('_Important_', { extensions })
console.log(renderHtml(document, { extensions }))
```

Document transforms persist in the AST, but HTML render hooks require the extension again at render time.

Source: `docs/guides/extensions.md`

### Tensions and Boundaries

#### HIGH Rich output versus untrusted-content safety

Prefer `ComponentNode` plus application components for rich output. Treat `allowHtml`, extension HTML strings, and highlighter markup as explicit trusted boundaries; see `production-pipelines`.

#### MEDIUM Parse-ahead performance versus option timing

Apply parser options and document-transform extensions before caching a `MarkdownDocument`. Renderer-time options cannot rebuild missing parse behavior; see `render-markdown` and `production-pipelines`.

#### HIGH Renderer parity versus customization

Core nodes stay equivalent across HTML, React, and Octane. HTML hooks and framework component replacements intentionally leave that parity boundary; see `react-rendering` and `octane-rendering`.

### Related Skills

- `render-markdown` for the AST, parser options, and standard renderers.
- `docs-features` for first-party extension implementations and metadata contracts.
- `react-rendering` for React mappings of emitted component tags.
- `octane-rendering` for Octane `ComponentBody` mappings.
- `production-pipelines` for trust, compatibility, and bundle audits.

<a id="source-tanstack-markdown-docs-features"></a>

## Docs Features

Source: `tanstack-markdown-docs-features`.

This skill builds on [render-markdown](./parsing-extensions.md#source-tanstack-markdown-render-markdown). Read it first for parser options, AST reuse, rendering, and core trust boundaries.

## Docs Features

### Setup

Create one extension array and use it for parsing and rendering:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `# Deployment

> [!TIP] Parse once
> Reuse the document for every renderer.

## Install

Run the package-manager command for your application.`

const extensions = docsMarkdownExtensions()
const document = parseMarkdown(source, { extensions })

export const headings = document.headings
export const html = renderHtml(document, {
  extensions,
  headingAnchors: true,
})
```

The preset composes callouts, transformed comment components, and heading collection. It emits metadata and custom elements; it does not install documentation UI behavior.

### Core Patterns

#### Collect headings without selector headings

```ts
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `# Guide

<!-- ::start:tabs -->

## React

React setup

## Solid

Solid setup

<!-- ::end:tabs -->

## API`

const extensions = docsMarkdownExtensions()

export const document = parseMarkdown(source, { extensions })
export const headings = document.headings
```

Heading collection defaults to skipping every heading inside a component named `tabs`. Pass `docsMarkdownExtensions({ collectHeadings: false })` to disable collection or an options object with `skipComponentNames` to replace the default skip set.

#### Author each tab input shape

Heading tabs split at the shallowest heading:

```md
<!-- ::start:tabs -->

## React

React setup

## Solid

Solid setup

<!-- ::end:tabs -->
```

File tabs select fenced code blocks and use `title=` or `file=` as labels:

````md
<!-- ::start:tabs variant="files" -->

```tsx file="app.tsx"
export function App() {
  return <main>Docs</main>
}
```

```css file="app.css"
main {
  display: block;
}
```

<!-- ::end:tabs -->
````

Package-manager tabs consume `framework: package...` lines and remove their source children after creating metadata:

```md
<!-- ::start:tabs variant="package-manager" mode="dev-install" -->

react: @tanstack/react-query @tanstack/react-router
solid: @tanstack/solid-query @tanstack/solid-router

<!-- ::end:tabs -->
```

Bundler tabs accept only Vite and Rsbuild heading sections:

````md
<!-- ::start:tabs variant="bundler" -->

## Vite

```ts
export default { plugins: [] }
```

## Rsbuild

```ts
export default { plugins: [] }
```

<!-- ::end:tabs -->
````

Every transform returns the original component unchanged when its required structure is absent. See [docs metadata contracts](./assets/tanstack-markdown-docs-features/references/docs-metadata.md) for exact properties and fallback rules.

#### Build framework-specific panels

```md
<!-- ::start:framework -->

# React

## Install

```tsx title="react.tsx"
export const framework = 'react'
```

# Solid

## Install

```tsx title="solid.tsx"
export const framework = 'solid'
```

<!-- ::end:framework -->
```

Framework blocks require level-one selector headings. They emit `md-framework-panel` children, lowercase framework names, label nested headings, and expose code-block metadata by framework.

#### Read component metadata before rendering

```ts
import type { ComponentNode } from '@tanstack/markdown'
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

interface TabDescriptor {
  slug: string
  name: string
}

function isTabsNode(node: unknown): node is ComponentNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    node.type === 'component' &&
    'name' in node &&
    node.name === 'tabs'
  )
}

const source = `<!-- ::start:tabs -->

## React

React content

## Solid

Solid content

<!-- ::end:tabs -->`

const document = parseMarkdown(source, {
  extensions: docsMarkdownExtensions(),
})
const tabsNode = document.children.find(isTabsNode)
const metadata = tabsNode?.properties?.['data-attributes']

export const tabs: TabDescriptor[] = metadata
  ? (JSON.parse(metadata) as { tabs: TabDescriptor[] }).tabs
  : []
```

`ComponentNode.properties` holds strings. JSON-bearing values are serialized into escaped HTML attributes by the HTML renderer and must be parsed by the consuming application.

### Common Mistakes

#### HIGH Assuming transformed tabs are interactive

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `<!-- ::start:tabs -->

## React

React content

<!-- ::end:tabs -->`

export const interactiveTabs = renderHtml(source, {
  extensions: docsMarkdownExtensions(),
})
```

Correct:

```ts
import type { ComponentNode } from '@tanstack/markdown'
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `<!-- ::start:tabs -->

## React

React content

<!-- ::end:tabs -->`

const document = parseMarkdown(source, {
  extensions: docsMarkdownExtensions(),
})
const tabsNode = document.children.find(
  (node): node is ComponentNode =>
    node.type === 'component' && node.name === 'tabs',
)

export const tabPanels =
  tabsNode?.children.filter(
    (node): node is ComponentNode =>
      node.type === 'component' && node.tagName === 'md-tab-panel',
  ) ?? []
```

The transform supplies a model and custom-element names; the site must bind those values to its own state, controls, and renderer components.

Source: `docs/guides/docs-preset.md`

#### HIGH Leaving a component block unmatched

Wrong:

```ts
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `<!-- ::start:tabs -->

## React

React content`

export const document = parseMarkdown(source, {
  extensions: docsMarkdownExtensions(),
})
```

Correct:

```ts
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `<!-- ::start:tabs -->

## React

React content

<!-- ::end:tabs -->`

export const document = parseMarkdown(source, {
  extensions: docsMarkdownExtensions(),
})
```

An unmatched start is consumed as an empty component, while the following body remains ordinary Markdown.

Source: `src/extensions/comment-components.ts:41-63`

#### MEDIUM Passing the wrong tab content shape

Wrong:

```ts
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `<!-- ::start:tabs variant="files" -->

This variant does not turn prose into a file.

<!-- ::end:tabs -->`

export const document = parseMarkdown(source, {
  extensions: docsMarkdownExtensions(),
})
```

Correct:

````ts
import { parseMarkdown } from '@tanstack/markdown/parser'
import { docsMarkdownExtensions } from '@tanstack/markdown/extensions/docs'

const source = `<!-- ::start:tabs variant="files" -->

\`\`\`ts file="app.ts"
export const app = true
\`\`\`

<!-- ::end:tabs -->`

export const document = parseMarkdown(source, {
  extensions: docsMarkdownExtensions(),
})
````

The file transform silently returns the original component when it finds no direct code-block children; the other variants have similarly specific input contracts.

Source: `src/extensions/tabs.ts:16-18`

#### MEDIUM Expecting fence metadata to highlight code

Wrong:

````ts
import { renderHtml } from '@tanstack/markdown/html'

const source = `\`\`\`ts file="app.ts" {2}
const one = 1
const two = 2
\`\`\``

export const html = renderHtml(source)
````

Correct:

````ts
import { createHighlighter } from '@tanstack/highlight/core'
import { plaintext } from '@tanstack/highlight/languages/plaintext'
import { ts } from '@tanstack/highlight/languages/ts'
import { createTanStackMarkdownHighlighter } from '@tanstack/highlight/markdown'
import { renderHtml } from '@tanstack/markdown/html'

const source = `\`\`\`ts file="app.ts" {2}
const one = 1
const two = 2
\`\`\``

const highlighter = createHighlighter({
  languages: [plaintext, ts],
})

export const html = renderHtml(source, {
  highlighter: createTanStackMarkdownHighlighter(highlighter),
})
````

Fence metadata populates the AST and highlighter options, but tokenization, themes, and CSS stay outside this package.

Source: `docs/core-concepts/syntax-profile.md`

### Boundaries

- Docs transforms enrich trusted repository-authored content but do not execute MDX, JSX, or JavaScript expressions.
- Highlighter output is trusted HTML. Keep highlighting at build time or on the server and apply the checks in [production-pipelines](./production.md#source-tanstack-markdown-production-pipelines).
- Import individual extension entry points when the complete preset adds unused behavior or bundle cost.
- Use [custom-extensions](./parsing-extensions.md#source-tanstack-markdown-custom-extensions) when built-in comment components or transforms do not express the required deterministic syntax.
- Use the React or Octane renderer skill to map emitted tags such as `md-tab-panel` and `md-framework-panel` to framework components.

### References

- [Docs metadata contracts](./assets/tanstack-markdown-docs-features/references/docs-metadata.md)

<a id="source-tanstack-markdown-render-markdown"></a>

## Render Markdown

Source: `tanstack-markdown-render-markdown`.

## Render Markdown

### Setup

Install the framework-neutral package:

```bash
pnpm add @tanstack/markdown
```

Render supported Markdown to HTML:

```ts
import { renderHtml } from '@tanstack/markdown/html'

const source = `# Release notes

- Small browser bundle
- Serializable AST
- Safe HTML defaults`

const html = renderHtml(source)

console.log(html)
```

Use the narrow `@tanstack/markdown/parser` and
`@tanstack/markdown/html` entry points when the default entry's combined
exports are unnecessary.

### Core Patterns

#### Parse once and render a reusable document

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'
import type { MarkdownDocument } from '@tanstack/markdown'

const source = `# Guide

Read the [installation notes](/installation).`

const document = parseMarkdown(source)
const serialized = JSON.stringify(document)
const restored = JSON.parse(serialized) as MarkdownDocument
const html = renderHtml(restored)

console.log(html)
```

All complete-document renderers accept a source string or an existing
`MarkdownDocument`; a document input skips parsing.

#### Configure frontmatter and heading IDs while parsing

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const source = `---
title: Installation
published: true
---

# Install

## Install`

const document = parseMarkdown(source, {
  frontmatter: true,
  headingIds(text, lineIndex) {
    const slug = text.toLowerCase().replaceAll(' ', '-')
    return `docs-${lineIndex}-${slug}`
  },
})

console.log(document.frontmatter)
console.log(renderHtml(document))
```

Frontmatter remains an unparsed string. Heading IDs are generated during
parsing and are duplicate-safe under the default slugger.

#### Add visible heading anchors while rendering

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const document = parseMarkdown('# API')

const html = renderHtml(document, {
  headingAnchors: {
    content: '#',
    className: 'heading-anchor',
    ariaHidden: true,
    tabIndex: -1,
  },
})

console.log(html)
```

Heading IDs are a parse concern; visible anchor links are a render concern.

#### Parse inline content only when no block context is needed

```ts
import { parseInline, renderInline } from '@tanstack/markdown'

const nodes = parseInline('Use **stable** APIs and `parseMarkdown`.')
const html = nodes.map(node => renderInline(node)).join('')

console.log(html)
```

`parseInline` handles inline syntax only. Use `parseMarkdown` for headings,
lists, tables, frontmatter, reference definitions, and footnote definitions.

### Behavioral Contracts

- Parsing is synchronous, deterministic, and normalizes line endings.
- Raw block and inline HTML are recognized only with `allowHtml: true`.
- Link and image URLs have unsafe executable protocols removed.
- Tight lists place simple content directly under `<li>`; loose lists retain
  paragraph wrappers; task checkboxes remain inline with labels.
- Reference definitions resolve case-insensitively before block parsing.
- Footnotes render in first-reference order with collision-safe IDs and
  repeated-reference back links.
- Code fence metadata is recorded in the AST; highlighting is external.
- The AST is public but pre-1.0. Regenerate persisted documents when an
  upgrade changes node contracts.

### Compatibility and Option Timing

TanStack Markdown targets controlled blog and documentation content rather
than complete CommonMark, GFM, MDX, or arbitrary HTML parsing. Before adding
syntax, require corpus evidence, regression coverage, renderer parity, and an
accepted bundle cost. See `./production.md#source-tanstack-markdown-production-pipelines` for compatibility,
security, highlighting, and size gates.

Parsing fixes the document structure. Apply `frontmatter`, `headingIds`,
`allowHtml`, parser state, and parser/transform extensions before caching the
AST. Renderer-only options such as `headingAnchors`, `highlighter`, and
`codeLineNumbers` may be applied when rendering an existing document.

### Common Mistakes

#### HIGH Assuming complete CommonMark or GFM behavior

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

const markdownFromAnywhere = `Heading
===

Visit https://example.com`

const html = renderHtml(markdownFromAnywhere)

console.log(html)
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'

const controlledMarkdown = `# Heading

Visit [example](https://example.com)`

const html = renderHtml(controlledMarkdown)

console.log(html)
```

Setext headings and automatic URL linking are outside the supported syntax
profile, so unsupported input can remain literal or have different structure.

Source: `docs/core-concepts/syntax-profile.md`

See also: `./production.md#source-tanstack-markdown-production-pipelines` - compatibility breadth must be
justified against corpus evidence and the bundle budget.

#### MEDIUM Reparsing unchanged content on every render

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'

const source = '# Cached article'

function renderArticle() {
  return renderHtml(source)
}

console.log(renderArticle())
console.log(renderArticle())
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const source = '# Cached article'
const document = parseMarkdown(source)

function renderArticle() {
  return renderHtml(document)
}

console.log(renderArticle())
console.log(renderArticle())
```

Complete-document renderers parse string inputs on every call, while a
`MarkdownDocument` input skips repeated parsing.

Source: `docs/core-concepts/document-model.md`

See also: `./production.md#source-tanstack-markdown-production-pipelines` - parse-ahead caching must preserve
the parser option and extension set.

#### HIGH Applying parser options after parsing

Wrong:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const document = parseMarkdown('# API')
const html = renderHtml(document, { headingIds: false })

console.log(html)
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const document = parseMarkdown('# API', { headingIds: false })
const html = renderHtml(document)

console.log(html)
```

Parse-only options do not retroactively alter a pre-parsed AST.

Source: `docs/reference/html.md`

See also: `./parsing-extensions.md#source-tanstack-markdown-custom-extensions` - parser and transform extensions must
also be present while creating a cached document.

#### MEDIUM Using parseInline for document definitions

Wrong:

```ts
import { parseInline, renderInline } from '@tanstack/markdown'

const source = `[Guide][guide]

[guide]: /guide`

const html = parseInline(source).map(node => renderInline(node)).join('')

console.log(html)
```

Correct:

```ts
import { renderHtml } from '@tanstack/markdown/html'
import { parseMarkdown } from '@tanstack/markdown/parser'

const source = `[Guide][guide]

[guide]: /guide`

const document = parseMarkdown(source)
const html = renderHtml(document)

console.log(html)
```

Standalone inline parsing does not extract document-level reference or
footnote definitions unless internal parser state is supplied explicitly.

Source: `docs/reference/default-entry.md`

### Related Skills

- `./production.md#source-tanstack-markdown-production-pipelines` - trust boundaries, syntax highlighting,
  practical compatibility, caching, tests, performance, and bundle budgets.
- `./framework-react.md#source-tanstack-markdown-react-rendering` - render the same source or AST as React nodes.
- `./framework-octane.md#source-tanstack-markdown-octane-rendering` - render the same source or AST as Octane nodes.
- `./parsing-extensions.md#source-tanstack-markdown-custom-extensions` - add deterministic parser and renderer hooks.
- `./parsing-extensions.md#source-tanstack-markdown-docs-features` - use the first-party documentation extensions.

### References

- [AST nodes, parser state, and render options](./assets/tanstack-markdown-render-markdown/references/ast-and-options.md)
