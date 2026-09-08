# Devtools Production — Design Tension

[Guide and prerequisites](./tanstack-devtools-production-258b04dd.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Design Tension

Development convenience pulls toward automatic stripping (dev dependencies, Vite plugin handles everything). Production usage pulls toward explicit inclusion (regular dependencies, disabled stripping, URL flag gating). These two paths are mutually exclusive in their dependency and configuration choices. A project must commit to one path. Attempting to mix them -- for example, keeping devtools as a dev dependency while setting `removeDevtoolsOnBuild: false` -- leads to builds that fail silently when the production environment prunes dev dependencies.

For staging/preview environments where you want devtools but not in the final production deployment, use `requireUrlFlag` with the development-only workflow intact, rather than switching to the production workflow.
