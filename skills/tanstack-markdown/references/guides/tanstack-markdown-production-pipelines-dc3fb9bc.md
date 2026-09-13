# Production Pipelines

<a id="source-tanstack-markdown-production-pipelines"></a>

Published skill · `@tanstack/markdown@0.0.15`.

[Topic index](../production.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Render Markdown](./tanstack-markdown-render-markdown-65ccbcde.md).

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-markdown-production-pipelines-dc3fb9bc--overview.md) — 1 KiB
- [Trust Boundary Checks](./tanstack-markdown-production-pipelines-dc3fb9bc--trust-boundary-checks.md) — 1 KiB
- [Highlighting Checks](./tanstack-markdown-production-pipelines-dc3fb9bc--highlighting-checks.md) — 2 KiB
- [Compatibility Checks](./tanstack-markdown-production-pipelines-dc3fb9bc--compatibility-checks.md) — 2 KiB
- [Performance and Cache Checks](./tanstack-markdown-production-pipelines-dc3fb9bc--performance-and-cache-checks.md) — 2 KiB
- [Release Checks](./tanstack-markdown-production-pipelines-dc3fb9bc--release-checks.md) — 1 KiB
- [Common Production Mistakes](./tanstack-markdown-production-pipelines-dc3fb9bc--common-production-mistakes.md) — 7 KiB
- [Tensions](./tanstack-markdown-production-pipelines-dc3fb9bc--tensions.md) — 1 KiB
- [Pre-Deploy Summary](./tanstack-markdown-production-pipelines-dc3fb9bc--pre-deploy-summary.md) — 1 KiB
- [Related Skills](./tanstack-markdown-production-pipelines-dc3fb9bc--related-skills.md) — 1 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="tanstack-markdown-production-pipeline-checklist"></a>
<a id="trust-boundary-checks"></a>
<a id="check-classify-every-markdown-source"></a>
<a id="highlighting-checks"></a>
<a id="check-return-trusted-code-contents-only"></a>
<a id="compatibility-checks"></a>
<a id="check-validate-the-actual-content-corpus"></a>
<a id="check-verify-deterministic-output"></a>
<a id="performance-and-cache-checks"></a>
<a id="check-parse-once-with-final-options"></a>
<a id="check-enforce-bundle-budgets"></a>
<a id="release-checks"></a>
<a id="check-run-the-complete-package-gate"></a>
<a id="common-production-mistakes"></a>
<a id="critical-enabling-html-for-untrusted-markdown"></a>
<a id="high-returning-highlighter-containers"></a>
<a id="critical-trusting-arbitrary-highlighter-output"></a>
<a id="medium-bundling-highlighting-into-static-clients"></a>
<a id="critical-treating-defaults-as-a-sanitizer"></a>
<a id="high-assuming-complete-commonmark-behavior"></a>
<a id="medium-reparsing-unchanged-content"></a>
<a id="high-injecting-html-into-react"></a>
<a id="medium-expecting-fence-metadata-to-highlight"></a>
<a id="tensions"></a>
<a id="compatibility-breadth-versus-bundle-budget"></a>
<a id="rich-trusted-output-versus-untrusted-content-safety"></a>
<a id="parse-ahead-performance-versus-option-timing"></a>
<a id="pre-deploy-summary"></a>
<a id="related-skills"></a>
