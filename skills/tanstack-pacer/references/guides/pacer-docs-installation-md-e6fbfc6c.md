# Installation

<a id="source-pacer-docs-installation-md"></a>

Release-matched documentation · `@tanstack/pacer@0.23.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Pacer packages are ESM-only, target ES2022, and require Node.js 20 or newer when running in Node.js. Use ESM imports or dynamic `import()` when consuming them.

Install the adapter for your framework with your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

react: @tanstack/react-pacer
solid: @tanstack/solid-pacer
angular: @tanstack/angular-pacer

<!-- ::end:tabs -->

Each framework package re-exports everything from the core `@tanstack/pacer` package, so you do not need to install the core package separately.

> [!NOTE]
> Not using a framework? Install the core `@tanstack/pacer` package directly for vanilla JavaScript.

<!-- ::start:framework -->

# React

## Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Pacer devtools plugin as dev dependencies to inspect your pacers at runtime.

# Solid

## Devtools

Developer tools are available using [TanStack Devtools](https://tanstack.com/devtools/latest). Install the devtools adapter and the Pacer devtools plugin as dev dependencies to inspect your pacers at runtime.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-pacer-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-pacer-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

# React

See the [devtools](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) page for setup and usage.

# Solid

See the [devtools](./pacer-docs-devtools-md-2f4aa95a.md#source-pacer-docs-devtools-md) page for setup and usage.

<!-- ::end:framework -->
