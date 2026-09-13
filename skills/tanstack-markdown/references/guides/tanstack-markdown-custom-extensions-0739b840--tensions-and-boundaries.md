# Custom Extensions — Tensions and Boundaries

[Guide and prerequisites](./tanstack-markdown-custom-extensions-0739b840.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Tensions and Boundaries

### HIGH Rich output versus untrusted-content safety

Prefer block or inline component nodes plus application components for rich output. Treat `allowHtml`, extension HTML strings, and highlighter markup as explicit trusted boundaries; see `production-pipelines`.

### MEDIUM Parse-ahead performance versus option timing

Apply parser options and document-transform extensions before caching a `MarkdownDocument`. Renderer-time options cannot rebuild missing parse behavior; see `render-markdown` and `production-pipelines`.

### HIGH Renderer parity versus customization

Core nodes stay equivalent across HTML, React, and Octane. HTML hooks and framework component replacements intentionally leave that parity boundary; see `react-rendering` and `octane-rendering`.
