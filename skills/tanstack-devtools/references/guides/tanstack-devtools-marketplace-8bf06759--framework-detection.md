# Devtools Marketplace — Framework Detection

[Guide and prerequisites](./tanstack-devtools-marketplace-8bf06759.md) · Published skill · `@tanstack/devtools@0.14.2`.

## Framework Detection

The marketplace determines the user's current framework by scanning their `package.json` dependencies for known framework packages:

| Framework | Detected packages    |
| --------- | -------------------- |
| react     | `react`, `react-dom` |
| solid     | `solid-js`           |
| vue       | `vue`, `@vue/core`   |
| svelte    | `svelte`             |
| angular   | `@angular/core`      |

Plugins with `framework: 'other'` are shown regardless of the detected framework.
