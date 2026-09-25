# Hotkeys — Automatic dependency tracking

[Guide and prerequisites](./hotkeys-docs-framework-solid-guides-hotkeys-md-56136a55.md) · Release-matched documentation · `@tanstack/hotkeys@0.10.0`.

## Automatic dependency tracking

Solid's fine-grained reactivity means `createHotkey` automatically tracks reactive dependencies. The callback always has access to the latest signal values:

```tsx
function Counter() {
  const [count, setCount] = createSignal(0)

  createHotkey('Mod+Shift+C', () => {
    console.log('Current count:', count())
  })

  return <button onClick={() => setCount(c => c + 1)}>Count: {count()}</button>
}
```
