# Installation

<a id="source-query-docs-framework-solid-installation-md"></a>

Release-matched documentation · `@tanstack/solid-query@5.102.8`.

[Topic index](../framework-solid.md) · [Source provenance](../SOURCES.md)

You can install Solid Query via [NPM](https://npmjs.com/),
or a good ol' `<script>` via
[ESM.sh](https://esm.sh/).

### NPM

```bash
npm i @tanstack/solid-query
```

or

```bash
pnpm add @tanstack/solid-query
```

or

```bash
yarn add @tanstack/solid-query
```

or

```bash
bun add @tanstack/solid-query
```

> Wanna give it a spin before you download? Try out the [simple](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/solid/simple/README.md) or [basic](https://github.com/TanStack/query/blob/2969edf32f7e0c48e2a108d84712d6e01edfde21/examples/solid/basic/README.md) examples!

### CDN

If you're not using a module bundler or package manager, you can also use this library via an ESM-compatible CDN such as [ESM.sh](https://esm.sh/). Simply add a `<script type="module">` tag to the bottom of your HTML file:

```html
<script type="module">
  import { QueryClient } from 'https://esm.sh/@tanstack/solid-query'
</script>
```

### Requirements

Solid Query is optimized for modern browsers. It is compatible with the following browsers config

```
Chrome >= 91
Firefox >= 90
Edge >= 91
Safari >= 15
iOS >= 15
Opera >= 77
```

> Depending on your environment, you might need to add polyfills. If you want to support older browsers, you need to transpile the library from `node_modules` yourselves.
