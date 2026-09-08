# Configure Selective Highlighting

<a id="source-tanstack-highlight-configure-selective-highlighting"></a>

Published skill · `@tanstack/highlight@0.0.10`.

[Topic index](../languages-configuration.md) · [Source provenance](../SOURCES.md)

# Configure Selective Highlighting

## Setup

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

## Core Patterns

### Render static blocks and later client content

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

### Normalize aliases before application branching

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

### Choose an intentional fallback

```ts
import { createHighlighter } from '@tanstack/highlight/core'
import { json } from '@tanstack/highlight/languages/json'

export const jsonHighlighter = createHighlighter({
  fallbackLanguage: 'json',
  languages: [json],
})
```

Unknown language names are tokenized as JSON in this registry; there is no auto-detection.

### Register optional embedded languages explicitly

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

## Common Mistakes

### CRITICAL Importing all languages into the client

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

### HIGH Rebuilding the registry per block

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

### HIGH Assuming an omitted language is detected

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

### CRITICAL Diverging server and client registries

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

### HIGH Omitting embedded tokenizer registrations

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

### HIGH Tension: convenience versus client size

The root helpers simplify setup but retain every language. Use `@tanstack/highlight/core` and direct language subpaths in hydrated clients.

See also: `./tanstack-highlight-integrate-framework-code-blocks-9c88ca76.md#source-tanstack-highlight-integrate-framework-code-blocks` - framework adapters should consume the same selective registry.

### HIGH Tension: language isolation versus embedding depth

Embedded highlighting depends on the application's registry. Keep dependencies explicit rather than importing another language from a definition.

See also: `./tanstack-highlight-extend-language-support-752c4660.md#source-tanstack-highlight-extend-language-support` - custom tokenizers delegate through `TokenizerContext`.

## References

- [Shipped languages, aliases, and imports](../assets/tanstack-highlight-configure-selective-highlighting/references/languages.md)

See also: `./tanstack-highlight-integrate-framework-code-blocks-9c88ca76.md#source-tanstack-highlight-integrate-framework-code-blocks` - matching registries and package versions preserve hydrated output.
