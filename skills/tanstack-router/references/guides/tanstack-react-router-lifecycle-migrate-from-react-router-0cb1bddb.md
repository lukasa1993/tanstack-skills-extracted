# Migrate From React Router

<a id="source-tanstack-react-router-lifecycle-migrate-from-react-router"></a>

Published skill · `@tanstack/react-router@1.170.46`.

[Topic index](../additional-guidance.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Router Core](./tanstack-router-core-3c7fd849.md).
Prerequisite: [React Router](./tanstack-react-router-1780aa7e.md).

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--overview.md) — 1 KiB
- [Pre-Migration](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--pre-migration.md) — 1 KiB
- [Route Definitions](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--route-definitions.md) — 3 KiB
- [Navigation](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--navigation.md) — 2 KiB
- [Search Params](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--search-params.md) — 2 KiB
- [Path Params](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--path-params.md) — 1 KiB
- [`useLocation` — Common Pitfall](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--uselocation-common-pitfall.md) — 2 KiB
- [Outlet](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--outlet.md) — 1 KiB
- [Loaders](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--loaders.md) — 2 KiB
- [Code Splitting](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--code-splitting.md) — 1 KiB
- [Cleanup](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--cleanup.md) — 1 KiB
- [Common Mistakes](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--common-mistakes.md) — 2 KiB
- [Quick Reference: API Mapping](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb--quick-reference-api-mapping.md) — 2 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="migrate-from-react-router-v7-to-tanstack-router"></a>
<a id="pre-migration"></a>
<a id="route-definitions"></a>
<a id="navigation"></a>
<a id="search-params"></a>
<a id="path-params"></a>
<a id="uselocation-common-pitfall"></a>
<a id="outlet"></a>
<a id="loaders"></a>
<a id="code-splitting"></a>
<a id="cleanup"></a>
<a id="common-mistakes"></a>
<a id="1-high-leaving-react-router-imports-alongside-tanstack-router"></a>
<a id="2-high-using-react-router-usesearchparams-pattern"></a>
<a id="3-high-interpolating-params-into-to-string"></a>
<a id="4-medium-using-param-syntax-instead-of-param"></a>
<a id="quick-reference-api-mapping"></a>
