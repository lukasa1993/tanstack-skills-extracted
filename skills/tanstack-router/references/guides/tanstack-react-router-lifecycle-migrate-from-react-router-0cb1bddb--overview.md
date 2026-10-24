# Migrate From React Router — Overview

[Guide and prerequisites](./tanstack-react-router-lifecycle-migrate-from-react-router-0cb1bddb.md) · Published skill · `@tanstack/react-router@1.170.46`.

# Migrate from React Router v7 to TanStack Router

This is a step-by-step migration checklist. Each check covers one conversion task. Complete them in order.

> **CRITICAL**: If your UI is blank after migration, open the console. Errors like "cannot use useNavigate outside of context" mean React Router imports remain alongside TanStack Router imports. Uninstall `react-router` (and `react-router-dom` if present) to surface them as TypeScript errors.
>
> **CRITICAL**: TanStack Router uses `to` + `params` for navigation, NOT template literal paths. Never interpolate params into the `to` string.
>
> **NOTE**: React Router v7 recommends importing from `react-router` (not `react-router-dom`). The `react-router-dom` package still exists but just re-exports from `react-router`. Check for imports from both.
