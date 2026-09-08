# Async Debouncing — When to Use Async Debouncing

[Guide and prerequisites](./pacer-docs-guides-async-debouncing-md-97c781af.md) · Release-matched documentation · `@tanstack/pacer@0.22.0`.

## When to Use Async Debouncing

You can usually just use the normal synchronous debouncer and it will work with async functions, but for advanced use cases, such as wanting to use the return value of a debounced function (instead of just calling a setState side effect), or putting your error handling logic in the debouncer, you can use the async debouncer.
