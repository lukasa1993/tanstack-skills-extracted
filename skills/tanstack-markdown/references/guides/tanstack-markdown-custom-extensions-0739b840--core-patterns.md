# Custom Extensions — Core Patterns

[Guide and prerequisites](./tanstack-markdown-custom-extensions-0739b840.md) · Published skill · `@tanstack/markdown@1.0.0`.

## Core Patterns

### Recognize inline source before formatting

Use `inlineParser: { markers, parse(context) }` for syntax that needs original source characters. `markers` is a string of literal first characters. The context supplies `source`, UTF-16 `index`, `options`, `inLink`, and `parseInline(value)` sharing the current depth and scan budget. Return `{ node, length }` with one standard `InlineNode` and a positive in-bounds integer length, or `undefined` to decline. Invalid lengths throw `RangeError`.

Escapes and code spans take precedence. Hooks do not run in code, image alt text, or link destinations; they do run in emphasis and link labels. Respect `inLink` when creating automatic links. Indices are local to the current inline container, and ranges cannot cross enclosing inline or block boundaries. Hook dispatch is budgeted, but callback work is trusted and must avoid repeated suffix scans. Returned AST nodes are trusted; validate URLs and component metadata yourself.

Use `transformInline` for changes to already-parsed nodes. It cannot distinguish an escaped opener from an ordinary text opener or restore raw Markdown spelling. See the extension guide for a complete source-parser example.

### Transform parsed inline nodes

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

Transforms receive both built-in inline nodes and extension nodes returned by `inlineParser`, and must return a deterministic replacement array.

For custom inline UI, return an `InlineComponentNode` with `type: 'inlineComponent'`,
`name`, `attributes`, inline `children`, and optional `tagName` and string `properties`.
It uses the same emitted-tag component maps as a block `ComponentNode`, but defaults
to `<span>` instead of `<md-comment-component>`. Keep tag and property names under
extension control, use phrasing content, and recurse through inline `children` when
transforming text nested inside links or emphasis. This does not require `allowHtml`.

### Derive document metadata after parsing

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

### Use an HTML hook only for HTML output

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

### Emit portable custom elements

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
