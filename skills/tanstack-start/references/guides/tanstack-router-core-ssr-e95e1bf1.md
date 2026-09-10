# Ssr

<a id="source-tanstack-router-core-ssr"></a>

Published skill · `@tanstack/router-core@1.171.29`.

[Topic index](../router-ssr-tooling-adapters.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Router Core](./tanstack-router-core-3c7fd849.md).
Prerequisite: [Data Loading](./tanstack-router-core-data-loading-9f5ce056.md).

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-router-core-ssr-e95e1bf1--overview.md) — 1 KiB
- [Concepts](./tanstack-router-core-ssr-e95e1bf1--concepts.md) — 1 KiB
- [Setup: Shared Router Factory](./tanstack-router-core-ssr-e95e1bf1--setup-shared-router-factory.md) — 1 KiB
- [Non-Streaming SSR](./tanstack-router-core-ssr-e95e1bf1--non-streaming-ssr.md) — 2 KiB
- [Streaming SSR](./tanstack-router-core-ssr-e95e1bf1--streaming-ssr.md) — 2 KiB
- [Document Head Management](./tanstack-router-core-ssr-e95e1bf1--document-head-management.md) — 3 KiB
- [Body Scripts](./tanstack-router-core-ssr-e95e1bf1--body-scripts.md) — 1 KiB
- [ScriptOnce for Pre-Hydration Scripts](./tanstack-router-core-ssr-e95e1bf1--scriptonce-for-pre-hydration-scripts.md) — 2 KiB
- [Express Integration Example](./tanstack-router-core-ssr-e95e1bf1--express-integration-example.md) — 2 KiB
- [Common Mistakes](./tanstack-router-core-ssr-e95e1bf1--common-mistakes.md) — 4 KiB
- [Tension: Client-First Loaders vs SSR](./tanstack-router-core-ssr-e95e1bf1--tension-client-first-loaders-vs-ssr.md) — 1 KiB
- [Cross-References](./tanstack-router-core-ssr-e95e1bf1--cross-references.md) — 1 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="ssr-server-side-rendering"></a>
<a id="concepts"></a>
<a id="setup-shared-router-factory"></a>
<a id="non-streaming-ssr"></a>
<a id="server-entry-using-defaultrenderhandler"></a>
<a id="server-entry-using-renderroutertostring-for-custom-wrappers"></a>
<a id="client-entry"></a>
<a id="streaming-ssr"></a>
<a id="server-entry-using-defaultstreamhandler"></a>
<a id="server-entry-using-renderroutertostream-for-custom-wrappers"></a>
<a id="document-head-management"></a>
<a id="root-route-with-head"></a>
<a id="per-route-head-nested-deduplication"></a>
<a id="spa-head-no-full-html-control"></a>
<a id="body-scripts"></a>
<a id="scriptonce-for-pre-hydration-scripts"></a>
<a id="express-integration-example"></a>
<a id="common-mistakes"></a>
<a id="1-high-using-browser-apis-in-loaders-without-environment-check"></a>
<a id="2-medium-using-hash-fragments-for-server-rendered-content"></a>
<a id="3-critical-generating-nextjs-remix-or-react-router-dom-patterns"></a>
<a id="wrong-file-structures"></a>
<a id="wrong-imports"></a>
<a id="wrong-loaderdata-fetching-patterns"></a>
<a id="tension-client-first-loaders-vs-ssr"></a>
<a id="cross-references"></a>
