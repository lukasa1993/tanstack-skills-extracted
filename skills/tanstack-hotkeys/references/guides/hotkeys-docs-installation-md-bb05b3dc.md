# Installation

<a id="source-hotkeys-docs-installation-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.35.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Install the adapter for your framework with your preferred package manager:

<!-- ::start:tabs variant="package-manager" -->

alpine: @tanstack/alpine-hotkeys
angular: @tanstack/angular-hotkeys
ember: @tanstack/ember-hotkeys
octane: @tanstack/octane-hotkeys
lit: @tanstack/lit-hotkeys
preact: @tanstack/preact-hotkeys
react: @tanstack/react-hotkeys
solid: @tanstack/solid-hotkeys
svelte: @tanstack/svelte-hotkeys
vue: @tanstack/vue-hotkeys

<!-- ::end:tabs -->

Every framework adapter re-exports the core `@tanstack/hotkeys` package, so you don't need to install both.

> [!NOTE]
> Not using a framework? Install `@tanstack/hotkeys` directly for vanilla JavaScript or TypeScript.

<!-- ::start:framework -->

# React

Requires React 18 or newer. `useHotkey` is a client hook and `HotkeysProvider` is a client component, so server components like Next.js `app/layout.tsx` can render `HotkeysProvider` directly. To pass `appHotkeys` from a Server Component, use `AppHotkeysProvider` instead. See [App hotkeys with Server Components](./hotkeys-docs-framework-react-guides-ssr-md-35086cce.md#source-hotkeys-docs-framework-react-guides-ssr-md).

Start with the [React Quick Start](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#source-hotkeys-docs-framework-react-quick-start-md). To add the devtools panel, install:

# Preact

Requires Preact 10.5.2 or newer (10.7.2 or newer when using TypeScript `"moduleResolution": "bundler"`).

Start with the [Preact Quick Start](./hotkeys-docs-framework-preact-quick-start-md-9cac7afa.md#source-hotkeys-docs-framework-preact-quick-start-md) and [Preact guides](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md). To add the devtools panel, install:

# Solid

Requires Solid 2 (Node 22.12 or newer) for `@tanstack/solid-hotkeys` 0.26 and newer, and `@tanstack/solid-hotkeys-devtools` 0.14 and newer. For Solid 1 (1.7 or newer), install `@tanstack/solid-hotkeys@0.25` and `@tanstack/solid-hotkeys-devtools@0.13` (for Solid 1.9.15 or newer).

Start with the [Solid Quick Start](./hotkeys-docs-framework-solid-quick-start-md-cfbf152e.md#source-hotkeys-docs-framework-solid-quick-start-md) and [Solid guides](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#source-hotkeys-docs-framework-solid-guides-hotkeys-md). To add the devtools panel, install:

# Angular

Requires Angular 19 or newer (21 or newer for the integrated devtools panel).

Start with the [Angular Quick Start](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#source-hotkeys-docs-framework-angular-quick-start-md) and [Angular guides](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md). To add the devtools panel, install:

# Vue

Requires Vue 3.3 or newer.

Start with the [Vue Quick Start](./hotkeys-docs-framework-vue-quick-start-md-468563f0.md#source-hotkeys-docs-framework-vue-quick-start-md) and [Vue guides](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md). To add the devtools panel, install:

# Svelte

Requires Svelte 5.40 or newer within version 5.

Start with the [Svelte Quick Start](./hotkeys-docs-framework-svelte-quick-start-md-6ea8096f.md#source-hotkeys-docs-framework-svelte-quick-start-md) and [Svelte guides](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-md). To add the devtools panel, install:

# Lit

Requires Lit 3 or newer.

Start with the [Lit Quick Start](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md) and [Lit guides](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#source-hotkeys-docs-framework-lit-guides-hotkeys-md). Lit ships the hotkeys adapter only and has no dedicated devtools package.

# Alpine

Requires Alpine 3.13 or newer within version 3. Register `hotkeysPlugin` with `Alpine.plugin(hotkeysPlugin)` before calling `Alpine.start()`.

Start with the [Alpine Quick Start](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md) and [Alpine guides](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#source-hotkeys-docs-framework-alpine-guides-hotkeys-md). Alpine ships the hotkeys adapter only and has no dedicated devtools package.

# Ember

Requires Ember 6.8.3 or newer (excluding 6.9.0 and 6.10.0), and works with Vite (Embroider) or classic `ember-cli` with `ember-auto-import`. Register hotkeys in strict-mode `.gts` components and pass the component as owner to state readers and recorders.

Start with the [Ember Quick Start](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md) and [Ember guides](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#source-hotkeys-docs-framework-ember-guides-hotkeys-md). Ember ships the hotkeys adapter only and has no dedicated devtools package.

# Octane

Requires Octane 0.12 or newer with compiler-enabled `.tsrx` components, and Node.js 22.22.2 or newer when running in Node.js.

Start with the [Octane Quick Start](./hotkeys-docs-framework-octane-quick-start-md-ecf7a027.md#source-hotkeys-docs-framework-octane-quick-start-md) and [Octane guides](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#source-hotkeys-docs-framework-octane-guides-hotkeys-md). Octane ships the hotkeys adapter only and has no dedicated devtools package.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

react: @tanstack/react-devtools
react: @tanstack/react-hotkeys-devtools
preact: @tanstack/preact-devtools
preact: @tanstack/preact-hotkeys-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-hotkeys-devtools
angular: @tanstack/angular-devtools
angular: @tanstack/angular-hotkeys-devtools
vue: @tanstack/vue-hotkeys-devtools
svelte: @tanstack/svelte-devtools
svelte: @tanstack/svelte-hotkeys-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

# React

See [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) for setup instructions.

# Preact

See [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) for setup instructions.

# Solid

See [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) for setup instructions.

# Angular

See [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) for setup instructions.

# Vue

See [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) for setup instructions.

# Svelte

See [Devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) for setup instructions.

<!-- ::end:framework -->
