# Installation

<a id="source-query-docs-framework-vue-installation-md"></a>

Release-matched documentation · `@tanstack/vue-query@5.105.0`.

[Topic index](../framework-vue.md) · [Source provenance](../SOURCES.md)

You can install Vue Query via [NPM](https://npmjs.com).

### NPM

```sh
npm i @tanstack/vue-query
```

or

```sh
pnpm add @tanstack/vue-query
```

or

```sh
yarn add @tanstack/vue-query
```

or

```sh
bun add @tanstack/vue-query
```

Vue Query is compatible with Vue v2.6+ and v3.3+.

> If you are using Vue 2.6, make sure to also setup [@vue/composition-api](https://github.com/vuejs/composition-api)

> Wanna give it a spin before you download? Try out the [basic](https://github.com/TanStack/query/blob/5cc606e2e84b6feb86a2284a984ba2d3ef1643c8/examples/vue/basic/README.md) example!

### Vue Query Initialization

Before using Vue Query, you need to initialize it using `VueQueryPlugin`

```tsx
import { VueQueryPlugin } from '@tanstack/vue-query'

app.use(VueQueryPlugin)
```

### Use of Composition API with `<script setup>`

All examples in our documentation use [`<script setup>`](https://vuejs.org/api/sfc-script-setup.html) syntax.

Vue 2 users can also use that syntax using [this plugin](https://github.com/antfu/unplugin-vue2-script-setup). Please check the plugin documentation for installation details.

If you are not a fan of `<script setup>` syntax, you can easily translate all the examples into normal Composition API syntax by moving the code under `setup()` function and returning the values used in the template.

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const { isPending, isFetching, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})
</script>

<template>...</template>
```
