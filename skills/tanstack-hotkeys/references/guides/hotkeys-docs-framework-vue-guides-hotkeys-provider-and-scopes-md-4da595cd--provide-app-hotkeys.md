# Hotkeys Provider And Scopes — Provide app hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-vue-guides-hotkeys-provider-and-scopes-md-4da595cd.md) · Release-matched documentation · `@tanstack/hotkeys@0.29.0`.

## Provide app hotkeys

Pass your [app hotkeys](./hotkeys-docs-framework-vue-guides-app-hotkeys-md-a950ea41.md#source-hotkeys-docs-framework-vue-guides-app-hotkeys-md) to the root provider, along with the user's saved custom hotkeys, and listen for changes to save them:

```vue
<template>
  <HotkeysProvider
    :app-hotkeys="appHotkeys"
    :custom-hotkeys="savedHotkeys"
    @custom-hotkeys-change="saveHotkeys"
  >
    <App />
  </HotkeysProvider>
</template>
```

Nested providers use the app hotkeys and custom hotkeys of the provider above them, so pass these only once, at the root.
