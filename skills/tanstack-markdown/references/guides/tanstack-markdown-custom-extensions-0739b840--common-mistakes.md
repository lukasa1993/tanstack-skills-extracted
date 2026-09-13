# Custom Extensions — Common Mistakes

[Guide and prerequisites](./tanstack-markdown-custom-extensions-0739b840.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Common Mistakes

### HIGH Claiming a block without consuming it

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

### HIGH Ordering a general parser first

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

### HIGH Using HTML hooks for framework nodes

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

`renderHtml` hooks do not run in React or Octane; a `ComponentNode` or `InlineComponentNode` and emitted-tag component mapping is the portable path.

Source: `docs/guides/extensions.md`

### MEDIUM Changing extensions after parsing

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
