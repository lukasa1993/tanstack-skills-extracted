# Languages and configuration

Selective highlighting and language extension.

<a id="source-tanstack-highlight-configure-selective-highlighting"></a>

## Configure Selective Highlighting

Source: `tanstack-highlight-configure-selective-highlighting`.

## Configure Selective Highlighting

### Setup

Create one module that both server and client code import:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'
import { json } from '@tanstack/highlight/languages/json'
import { shell } from '@tanstack/highlight/languages/shell'
import { ts } from '@tanstack/highlight/languages/ts'
import { tsx } from '@tanstack/highlight/languages/tsx'

export const highlighter = createHighlighter({
  languages: [css, html, js, json, shell, ts, tsx],
})
```

Keep this module isomorphic. It needs no server-only or browser-only imports.

### Core Patterns

#### Render static blocks and later client content

```ts
import { highlighter } from './highlight'

export function renderDocumentationCode(code: string, lang: string) {
  return highlighter.renderCodeBlockData({
    code,
    lang,
    lineNumbers: true,
  })
}
```

Initial SSR output can hydrate unchanged; call the same function only for code introduced after hydration.

#### Normalize aliases before application branching

```ts
import { highlighter } from './highlight'

export function getRegisteredLanguage(lang: string | undefined) {
  return highlighter.normalizeLanguage(lang)
}

getRegisteredLanguage('typescript')
getRegisteredLanguage('bash')
getRegisteredLanguage('not-registered')
```

The results are `ts`, `shell`, and the configured fallback, which defaults to `plaintext`.

#### Choose an intentional fallback

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { json } from '@tanstack/highlight/languages/json'

export const jsonHighlighter = createHighlighter({
  fallbackLanguage: 'json',
  languages: [json],
})
```

Unknown language names are tokenized as JSON in this registry; there is no auto-detection.

#### Register optional embedded languages explicitly

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'

export const markupHighlighter = createHighlighter({
  languages: [html, css, js],
})
```

Without `css` and `js`, HTML tags still highlight but style and script bodies remain plain.

### Common Mistakes

#### CRITICAL Importing all languages into the client

Wrong:

```ts
import { highlight } from '@tanstack/highlight'

export const html = highlight('const answer = 42', { lang: 'ts' }).html
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { ts } from '@tanstack/highlight/languages/ts'

const highlighter = createHighlighter({ languages: [ts] })

export const html = highlighter.highlightToHtml('const answer = 42', {
  lang: 'ts',
})
```

The root entry constructs and retains the all-language registry.

Source: `docs/guides/language-registration.md`

#### HIGH Rebuilding the registry per block

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { tsx } from '@tanstack/highlight/languages/tsx'

export function render(code: string) {
  return createHighlighter({ languages: [tsx] }).highlightToHtml(code, {
    lang: 'tsx',
  })
}
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { tsx } from '@tanstack/highlight/languages/tsx'

const highlighter = createHighlighter({ languages: [tsx] })

export function render(code: string) {
  return highlighter.highlightToHtml(code, { lang: 'tsx' })
}
```

The immutable registry can be shared across blocks and requests.

Source: `docs/guides/language-registration.md`

#### HIGH Assuming an omitted language is detected

Wrong:

```ts
import { highlighter } from './highlight'

export const html = highlighter.highlightToHtml('const answer = 42')
```

Correct:

```ts
import { highlighter } from './highlight'

export const html = highlighter.highlightToHtml('const answer = 42', {
  lang: 'ts',
})
```

Only registered names and aliases resolve; omitted or unknown names use the fallback.

Source: `src/core.ts`

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

Different registries change normalization and embedded delegation across hydration.

Source: `docs/guides/ssr-and-client.md`

#### HIGH Omitting embedded tokenizer registrations

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { html } from '@tanstack/highlight/languages/html'

export const highlighter = createHighlighter({ languages: [html] })
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { css } from '@tanstack/highlight/languages/css'
import { html } from '@tanstack/highlight/languages/html'
import { js } from '@tanstack/highlight/languages/js'

export const highlighter = createHighlighter({
  languages: [html, css, js],
})
```

Outer markup remains highlighted, but unregistered script and style bodies are intentionally plain.

Source: `docs/guides/embedded-languages.md`

#### HIGH Tension: convenience versus client size

The root helpers simplify setup but retain every language. Use `@tanstack/highlight/core` and direct language subpaths in hydrated clients.

See also: `./integrations.md#source-tanstack-highlight-integrate-framework-code-blocks` - framework adapters should consume the same selective registry.

#### HIGH Tension: language isolation versus embedding depth

Embedded highlighting depends on the application's registry. Keep dependencies explicit rather than importing another language from a definition.

See also: `./languages-configuration.md#source-tanstack-highlight-extend-language-support` - custom tokenizers delegate through `TokenizerContext`.

### References

- [Shipped languages, aliases, and imports](./assets/tanstack-highlight-configure-selective-highlighting/references/languages.md)

See also: `./integrations.md#source-tanstack-highlight-integrate-framework-code-blocks` - matching registries and package versions preserve hydrated output.

<a id="source-tanstack-highlight-extend-language-support"></a>

## Extend Language Support

Source: `tanstack-highlight-extend-language-support`.

This skill builds on `configure-selective-highlighting`. Read it first for explicit registration and optional embedding.

## Extend Language Support

### Setup

Define an isolated tokenizer that returns semantic source ranges:

```ts
import {
  createHighlighter,
  defineLanguage,
  type TokenRange,
} from '@tanstack/highlight/core'

const taskList = defineLanguage({
  name: 'task-list',
  aliases: ['tasks'],
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    const pattern = /\b(?:TODO|DONE|BLOCKED)\b/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(code))) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        className: match[0] === 'DONE' ? 'inserted' : 'keyword',
      })
    }

    return ranges
  },
})

export const highlighter = createHighlighter({
  languages: [taskList],
})
```

Gaps remain plain text automatically. Ranges must be non-overlapping, zero-based, end-exclusive UTF-16 offsets.

### Core Patterns

#### Preserve exact source through tokenization

```ts
import { highlighter } from './task-list-highlighter'

const code = 'TODO write docs\nDONE add tests'
const result = highlighter.tokenize(code, { lang: 'tasks' })

export const sourceWasPreserved =
  result.tokens.map((token) => token.value).join('') === code
```

Source reconstruction is the primary tokenizer invariant.

#### Delegate embedded content through the registry

```ts
import {
  createHighlighter,
  defineLanguage,
  type TokenRange,
} from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'

const scriptDocument = defineLanguage({
  name: 'script-document',
  tokenize(code, context) {
    const ranges: Array<TokenRange> = []
    const pattern = /<script>([\s\S]*?)<\/script>/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(code))) {
      const openStart = match.index
      const bodyStart = openStart + '<script>'.length
      const bodyEnd = bodyStart + match[1].length
      const closeEnd = bodyEnd + '</script>'.length

      ranges.push({ start: openStart, end: bodyStart, className: 'tag' })

      if (context.hasLanguage('js')) {
        ranges.push(
          ...context.tokenize(match[1], 'js').map((range) => ({
            ...range,
            start: range.start + bodyStart,
            end: range.end + bodyStart,
          })),
        )
      }

      ranges.push({ start: bodyEnd, end: closeEnd, className: 'tag' })
    }

    return ranges
  },
})

export const highlighter = createHighlighter({
  languages: [scriptDocument, js],
})
```

The outer definition remains independent of JavaScript; the application decides whether delegation is available.

#### Prefer unclassified text over incorrect classes

```ts
import { defineLanguage, type TokenRange } from '@tanstack/highlight/core'

export const identifiers = defineLanguage({
  name: 'identifiers',
  tokenize(code) {
    const ranges: Array<TokenRange> = []
    const pattern = /\b[A-Z][A-Za-z0-9]*\b/g
    let match: RegExpExecArray | null

    while ((match = pattern.exec(code))) {
      ranges.push({
        start: match.index,
        end: match.index + match[0].length,
        className: 'type',
      })
    }

    return ranges
  },
})
```

Do not classify ambiguous gaps merely to increase token coverage.

### Common Mistakes

#### CRITICAL Returning inclusive range ends

Wrong:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function keywordRange(start: number, value: string): TokenRange {
  return {
    start,
    end: start + value.length - 1,
    className: 'keyword',
  }
}
```

Correct:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function keywordRange(start: number, value: string): TokenRange {
  return {
    start,
    end: start + value.length,
    className: 'keyword',
  }
}
```

Range ends match `String.prototype.slice()` and exclude the end offset.

Source: `docs/guides/custom-languages.md`

#### HIGH Returning overlapping token ranges

Wrong:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function tokenize(code: string): Array<TokenRange> {
  return [
    { start: 0, end: code.length, className: 'string' },
    { start: 6, end: 10, className: 'keyword' },
  ]
}
```

Correct:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export function tokenize(code: string): Array<TokenRange> {
  const keywordStart = code.indexOf('TODO')

  return keywordStart < 0
    ? []
    : [
        {
          start: keywordStart,
          end: keywordStart + 'TODO'.length,
          className: 'keyword',
        },
      ]
}
```

The core sorts by source position and drops later overlaps, so an earlier broad range can suppress a specific range.

Source: `src/core.ts`

#### CRITICAL Importing an embedded definition into a language

Wrong:

```ts
import { defineLanguage } from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'

export const scriptDocument = defineLanguage({
  name: 'script-document',
  tokenize(code, context) {
    return js.tokenize(code, context)
  },
})
```

Correct:

```ts
import { defineLanguage } from '@tanstack/highlight/core'

export const scriptDocument = defineLanguage({
  name: 'script-document',
  tokenize(code, context) {
    return context.hasLanguage('js') ? context.tokenize(code, 'js') : []
  },
})
```

Direct definition imports make an embedded dependency part of every outer-language bundle.

Source: `docs/guides/custom-languages.md`

#### HIGH Inventing language-specific token classes

Wrong:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export const range = {
  start: 0,
  end: 4,
  className: 'tsx-generic',
} as unknown as TokenRange
```

Correct:

```ts
import type { TokenRange } from '@tanstack/highlight/core'

export const range = {
  start: 0,
  end: 4,
  className: 'type',
} satisfies TokenRange
```

The fixed semantic union keeps every theme complete and language-independent.

Source: `src/core.ts`

#### CRITICAL Shipping without tokenizer quality gates

Wrong:

```ts
import { defineLanguage } from '@tanstack/highlight/core'

export const taskList = defineLanguage({
  name: 'task-list',
  tokenize() {
    return []
  },
})
```

Correct:

```ts
import { expect, test } from 'vitest'
import { createHighlighter } from '@tanstack/highlight/core'
import { taskList } from '../src/languages/task-list'

test('task-list reconstructs valid source', () => {
  const highlighter = createHighlighter({ languages: [taskList] })
  const code = 'TODO write docs'
  const result = highlighter.tokenize(code, { lang: 'task-list' })

  expect(result.tokens.map((token) => token.value).join('')).toBe(code)
  expect(result.tokens.some((token) => token.className === 'keyword')).toBe(
    true,
  )
})
```

Shipped languages require valid-code fixtures, source reconstruction, focused regressions, and explicit-import size evaluation.

Source: `docs/guides/custom-languages.md`

#### HIGH Omitting embedded tokenizer registration

Wrong:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { scriptDocument } from './script-document'

export const highlighter = createHighlighter({
  languages: [scriptDocument],
})
```

Correct:

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { js } from '@tanstack/highlight/languages/js'
import { scriptDocument } from './script-document'

export const highlighter = createHighlighter({
  languages: [scriptDocument, js],
})
```

Delegation remains plain when the target definition is absent from the same registry.

Source: `docs/guides/embedded-languages.md`

#### HIGH Tension: language isolation versus embedding depth

Use `TokenizerContext` for optional delegation and let the application register targets. Importing target definitions inside an outer tokenizer hides bundle cost.

See also: `./languages-configuration.md#source-tanstack-highlight-configure-selective-highlighting` - registration controls delegated language availability.

### References

- [Tokenizer contracts and repository implementation patterns](./assets/tanstack-highlight-extend-language-support/references/tokenizer-patterns.md)

See also: `./languages-configuration.md#source-tanstack-highlight-configure-selective-highlighting` - aliases, fallbacks, and embedded targets resolve through the registry.
