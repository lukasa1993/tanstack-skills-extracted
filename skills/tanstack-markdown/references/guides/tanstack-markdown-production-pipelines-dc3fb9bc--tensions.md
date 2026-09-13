# Production Pipelines — Tensions

[Guide and prerequisites](./tanstack-markdown-production-pipelines-dc3fb9bc.md) · Published skill · `@tanstack/markdown@0.0.15`.

## Tensions

### Compatibility breadth versus bundle budget

Do not maximize conformance by default. Require target-corpus evidence, renderer coverage, and measured bundle cost before adding syntax.

### Rich trusted output versus untrusted-content safety

Do not enable raw HTML, extension HTML, or highlighter markup globally to solve presentation needs. Scope each trusted callback to controlled content.

### Parse-ahead performance versus option timing

Build cached ASTs with final parser options and document transforms. Keep required HTML render hooks active when rendering those cached documents.
