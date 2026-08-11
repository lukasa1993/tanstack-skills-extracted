# Package structure and dependencies

Package organization and dependency policy.

<a id="source-config-docs-dependencies-md"></a>

## Dependencies

Source: `config:docs/dependencies.md`.

We use 3 separate tools to help manage our dependencies and prevent us from unnecessarily bloating the `node_modules` directory.

#### Sherif

- Sherif ensures that all references to a dependency throughout the monorepo are on the same version
- This helps avoid pnpm resolution issues, such as type conflicts from having 2+ incompatible versions of the same dependency installed

#### Knip

- Knip is able to detect unused dependencies within `package.json` files
- This leads to fewer packages getting installed unnecessarily by developers

#### Renovate

- Renovate is a bot which runs on GitHub to scan for outdated or insecure dependencies
- This reduces the burden on maintainers by automatically submitting PRs

<a id="source-config-docs-overview-md"></a>

## Overview

Source: `config:docs/overview.md`.

TanStack Config is a collection of tools we currently use between our projects to simplify configuration.

### Required Pre-Requisites

The following tools are required to use these packages:

- [Node.js v20.17.0+](https://nodejs.org/en/download/current/)
- [Git CLI](https://git-scm.com/downloads)
- [GitHub CLI](https://cli.github.com/) (pre-installed on GitHub Actions)
- [pnpm v10+](https://pnpm.io/)

> pnpm is the only supported package manager for TanStack Config.

### Utilities

- [ESLint](./toolchain.md#source-config-docs-eslint-md)
- [Publish](./publishing-ci.md#source-config-docs-publish-md)
- [Vite](./toolchain.md#source-config-docs-vite-md)

### Conventions

- [CI/CD](./publishing-ci.md#source-config-docs-ci-cd-md)
- [Dependencies](./package-structure.md#source-config-docs-dependencies-md)
- [Package Structure](./package-structure.md#source-config-docs-package-structure-md)

<a id="source-config-docs-package-structure-md"></a>

## Package Structure

Source: `config:docs/package-structure.md`.

The following structure ensures packages work optimally with our monorepo/Nx workflow.

#### `./package.json`

- All TanStack projects have `"type": "module"` to set the default resolution of `.js` files to ESM; this does not have any impact on building for CJS
- It is also essential to have an `"exports"` field
- For legacy reasons, you should also include the `"main"`, `"module"`, and `"types"` fields
- All packages have the following scripts which are cached by Nx: `"test:eslint"`, `"test:types"`, `"test:lib"`, `"build"`, `"test:build"`

#### `./tsconfig.json`

- Extends the root-level tsconfig (e.g. `"extends": "../../tsconfig.json"`)
- Add any framework-specific options and included files here

#### `./src`

- This folder should only include code which gets built and shipped to users
- Tests should not be placed in this folder, as they bloat the shipped code, and can unintentionally invalidate the Nx cache

#### `./tests`

- This folder should include all test files
- It should also include any test setup files required by that framework

#### `./tsdown.config.ts`

- Defines `tsdown` config, including any framework-specific plugins.

#### `./vitest.config.ts`

- Defines config for Vitest
