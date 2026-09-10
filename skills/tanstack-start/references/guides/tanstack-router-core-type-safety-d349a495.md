# Type Safety

<a id="source-tanstack-router-core-type-safety"></a>

Published skill · `@tanstack/router-core@1.171.29`.

[Topic index](../router-essentials.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Router Core](./tanstack-router-core-3c7fd849.md).

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-router-core-type-safety-d349a495--overview.md) — 1 KiB
- [The ONE Required Type Annotation: Register](./tanstack-router-core-type-safety-d349a495--the-one-required-type-annotation-register.md) — 1 KiB
- [Types Flow Automatically](./tanstack-router-core-type-safety-d349a495--types-flow-automatically.md) — 3 KiB
- [Narrowing with `from`](./tanstack-router-core-type-safety-d349a495--narrowing-with-from.md) — 2 KiB
- [Shared Components: `strict: false`](./tanstack-router-core-type-safety-d349a495--shared-components-strict-false.md) — 1 KiB
- [Code-Split Files: `getRouteApi`](./tanstack-router-core-type-safety-d349a495--code-split-files-getrouteapi.md) — 1 KiB
- [TypeScript Performance](./tanstack-router-core-type-safety-d349a495--typescript-performance.md) — 3 KiB
- [Type Utilities for Generic Components](./tanstack-router-core-type-safety-d349a495--type-utilities-for-generic-components.md) — 3 KiB
- [Render Optimizations](./tanstack-router-core-type-safety-d349a495--render-optimizations.md) — 1 KiB
- [Common Mistakes](./tanstack-router-core-type-safety-d349a495--common-mistakes.md) — 4 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="type-safety"></a>
<a id="the-one-required-type-annotation-register"></a>
<a id="types-flow-automatically"></a>
<a id="route-hooks-no-annotation-needed"></a>
<a id="context-flows-through-the-tree"></a>
<a id="narrowing-with-from"></a>
<a id="on-hooks"></a>
<a id="on-link"></a>
<a id="shared-components-strict-false"></a>
<a id="code-split-files-getrouteapi"></a>
<a id="typescript-performance"></a>
<a id="use-object-syntax-for-addchildren-in-large-route-trees"></a>
<a id="avoid-returning-unused-inferred-types-from-loaders"></a>
<a id="as-const-satisfies-for-link-option-objects"></a>
<a id="type-safe-link-option-arrays"></a>
<a id="type-utilities-for-generic-components"></a>
<a id="validatelinkoptions-type-safe-link-props-in-custom-components"></a>
<a id="validatenavigateoptions-and-validateredirectoptions"></a>
<a id="render-props-for-maximum-performance"></a>
<a id="render-optimizations"></a>
<a id="fine-grained-selectors-with-select"></a>
<a id="structural-sharing"></a>
<a id="common-mistakes"></a>
<a id="1-critical-adding-type-annotations-or-casts-to-inferred-values"></a>
<a id="2-high-using-un-narrowed-linkprops-type"></a>
<a id="3-high-not-narrowing-linkusenavigate-with-from"></a>
<a id="4-critical-cross-skill-missing-router-type-registration"></a>
<a id="5-critical-cross-skill-wrong-framework-imports-and-file-structure"></a>
<a id="6-critical-treating-typecheck-as-proof-of-runtime-schema-propagation"></a>
