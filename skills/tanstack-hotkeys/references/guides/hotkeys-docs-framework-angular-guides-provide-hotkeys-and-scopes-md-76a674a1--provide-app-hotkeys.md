# Provide Hotkeys And Scopes — Provide app hotkeys

[Guide and prerequisites](./hotkeys-docs-framework-angular-guides-provide-hotkeys-and-scopes-md-76a674a1.md) · Release-matched documentation · `@tanstack/hotkeys@0.26.0`.

## Provide app hotkeys

Pass your [app hotkeys](./hotkeys-docs-framework-angular-guides-app-hotkeys-md-81139047.md#source-hotkeys-docs-framework-angular-guides-app-hotkeys-md) in the application config, along with the user's saved custom hotkeys and a function that saves changes:

```ts
bootstrapApplication(AppComponent, {
  providers: [
    provideHotkeys({
      appHotkeys,
      customHotkeys: savedHotkeys,
      onCustomHotkeysChange: saveHotkeys,
    }),
  ],
})
```

Nested providers use the app hotkeys and custom hotkeys of the provider above them, so pass these only once, in the application config.
