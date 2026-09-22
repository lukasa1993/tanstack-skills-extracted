# Hotkeys — Stale closure prevention

[Guide and prerequisites](./hotkeys-docs-framework-preact-guides-hotkeys-md-c4606a30.md) · Release-matched documentation · `@tanstack/hotkeys@0.9.0`.

## Stale closure prevention

The `useHotkey` hook automatically syncs the callback on every render, so you never need to worry about stale closures:

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // This callback always has access to the latest `count` value
  useHotkey('Mod+Shift+C', () => {
    console.log('Current count:', count)
  })

  return <button onClick={() => setCount(count + 1)}>Count: {count}</button>
}
```
