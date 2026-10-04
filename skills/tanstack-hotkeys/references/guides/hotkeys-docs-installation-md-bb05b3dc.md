# Installation

<a id="source-hotkeys-docs-installation-md"></a>

Release-matched documentation · `@tanstack/hotkeys@0.11.0`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

Install the adapter for your framework with your preferred package manager:

<!-- ::start:tabs variant="package-managers" -->

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

Each framework package re-exports everything from the core `@tanstack/hotkeys` package, so you don't need to install the core package separately.

> [!NOTE]
> If you are not using a framework, you can install the core `@tanstack/hotkeys` package directly for use with vanilla JavaScript.

<!-- ::start:framework -->

### Alpine

Use Alpine 3.15.12 or newer within version 3. Install the optional `hotkeysPlugin` before `Alpine.start()`, or create a scope explicitly.

Start with the [Quick Start](./hotkeys-docs-framework-alpine-quick-start-md-3845b066.md#source-hotkeys-docs-framework-alpine-quick-start-md), then follow the [guides](./hotkeys-docs-framework-alpine-guides-hotkeys-md-baac02c3.md#source-hotkeys-docs-framework-alpine-guides-hotkeys-md). The package includes the hotkeys adapter; a dedicated Alpine devtools adapter is not provided.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Ember

Use Ember 6.8 or newer. Register hotkeys with imported template helpers in strict-mode `.gts` components. Pass the component as owner to state readers and recorders.

Start with the [Quick Start](./hotkeys-docs-framework-ember-quick-start-md-d5e4889e.md#source-hotkeys-docs-framework-ember-quick-start-md), then follow the [guides](./hotkeys-docs-framework-ember-guides-hotkeys-md-0dc069c5.md#source-hotkeys-docs-framework-ember-guides-hotkeys-md). The package includes the hotkeys adapter; a dedicated Ember devtools adapter is not provided.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Octane

Use Octane 0.1.36 or newer within version 0.1, with compiler-enabled `.tsrx` components. The Octane adapter requires Node.js 22.22.2 or newer when used in Node.js.

Start with the [Quick Start](./hotkeys-docs-framework-octane-quick-start-md-ecf7a027.md#source-hotkeys-docs-framework-octane-quick-start-md), then follow the [guides](./hotkeys-docs-framework-octane-guides-hotkeys-md-b84cce4e.md#source-hotkeys-docs-framework-octane-guides-hotkeys-md). The package includes the hotkeys adapter; a dedicated Octane devtools adapter is not provided.

<!-- ::end:framework -->

<!-- ::start:framework -->

### React

Start with the [Quick Start](./hotkeys-docs-framework-react-quick-start-md-56a91190.md#source-hotkeys-docs-framework-react-quick-start-md) guide. If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Preact

Start with the [API reference](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/framework/preact/reference/index.md) and [guides](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md#source-hotkeys-docs-framework-preact-guides-hotkeys-md). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Solid

Start with the [API reference](https://github.com/TanStack/hotkeys/blob/748379f3ac2df52b7e5f2aae9cceed2ce1bea78f/docs/framework/solid/reference/index.md) and [guides](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md#source-hotkeys-docs-framework-solid-guides-hotkeys-md). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Svelte

Start with the [Quick Start](./hotkeys-docs-framework-svelte-quick-start-md-6ea8096f.md#source-hotkeys-docs-framework-svelte-quick-start-md) guide and the Svelte-specific [guides](./hotkeys-docs-framework-svelte-guides-hotkeys-md-cb786a5b.md#source-hotkeys-docs-framework-svelte-guides-hotkeys-md). If you want the integrated devtools panel, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Angular

Start with the [Quick Start](./hotkeys-docs-framework-angular-quick-start-md-4845adfe.md#source-hotkeys-docs-framework-angular-quick-start-md) guide and the Angular-specific [guides](./hotkeys-docs-framework-angular-guides-hotkeys-md-defb12a7.md#source-hotkeys-docs-framework-angular-guides-hotkeys-md).

The integrated devtools panel requires Angular 21 or newer. To use it, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Vue

Start with the [Quick Start](./hotkeys-docs-framework-vue-quick-start-md-468563f0.md#source-hotkeys-docs-framework-vue-quick-start-md) guide and the Vue-specific [guides](./hotkeys-docs-framework-vue-guides-hotkeys-md-8a8ae11c.md#source-hotkeys-docs-framework-vue-guides-hotkeys-md).

If you want the Vue devtools panel component, also install:

<!-- ::end:framework -->

<!-- ::start:framework -->

### Lit

Start with the [Quick Start](./hotkeys-docs-framework-lit-quick-start-md-e9425977.md#source-hotkeys-docs-framework-lit-quick-start-md) guide and the Lit-specific [guides](./hotkeys-docs-framework-lit-guides-hotkeys-md-44cc9637.md#source-hotkeys-docs-framework-lit-guides-hotkeys-md).

Lit currently ships the hotkeys adapter only, so no dedicated Lit devtools package is required.

<!-- ::end:framework -->

<!-- ::start:tabs variant="package-manager" -->

angular: @tanstack/angular-devtools
angular: @tanstack/angular-hotkeys-devtools
svelte: @tanstack/svelte-devtools
svelte: @tanstack/svelte-hotkeys-devtools
preact: @tanstack/preact-devtools
preact: @tanstack/preact-hotkeys-devtools
react: @tanstack/react-devtools
react: @tanstack/react-hotkeys-devtools
solid: @tanstack/solid-devtools
solid: @tanstack/solid-hotkeys-devtools
vue: @tanstack/vue-hotkeys-devtools

<!-- ::end:tabs -->

<!-- ::start:framework -->

### React

See the [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Preact

See the [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Solid

See the [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Vue

See the [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Angular

See the [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->

<!-- ::start:framework -->

### Svelte

See the [devtools](./hotkeys-docs-devtools-md-3036b65e.md#source-hotkeys-docs-devtools-md) documentation for setup details.

<!-- ::end:framework -->
