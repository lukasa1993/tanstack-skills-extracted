# Ssr — ScriptOnce for Pre-Hydration Scripts

[Guide and prerequisites](./tanstack-router-core-ssr-e95e1bf1.md) · Published skill · `@tanstack/router-core@1.171.28`.

## ScriptOnce for Pre-Hydration Scripts

`ScriptOnce` renders a `<script>` during SSR that executes immediately and self-removes. On client navigation, it does nothing (no duplicate execution).

```tsx
import { ScriptOnce } from '@tanstack/react-router'

const themeScript = `(function() {
  try {
    const theme = localStorage.getItem('theme') || 'auto';
    const resolved = theme === 'auto'
      ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;
    document.documentElement.classList.add(resolved);
  } catch (e) {}
})();`

function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScriptOnce children={themeScript} />
      {children}
    </>
  )
}
```

If the script modifies the DOM (e.g., adds a class to `<html>`), use `suppressHydrationWarning` on the element:

```tsx
<html lang="en" suppressHydrationWarning>
```
