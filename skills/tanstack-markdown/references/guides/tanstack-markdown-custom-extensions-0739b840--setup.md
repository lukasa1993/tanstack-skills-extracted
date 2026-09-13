# Custom Extensions — Setup

[Guide and prerequisites](./tanstack-markdown-custom-extensions-0739b840.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Setup

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
