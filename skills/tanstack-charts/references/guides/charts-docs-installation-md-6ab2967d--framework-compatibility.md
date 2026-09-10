# Installation — Framework compatibility

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@0.18.0`.

## Framework compatibility

| Adapter subpath                 | Framework peers                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `@tanstack/charts/react`        | React and React DOM 18 or 19                                                    |
| `@tanstack/charts/react-native` | React `^19.2.3`, React Native `^0.86.0`, and `react-native-svg` `>=15.15.4 <16` |
| `@tanstack/charts/preact`       | Preact `>=10`                                                                   |
| `@tanstack/charts/vue`          | Vue `>=3.5`                                                                     |
| `@tanstack/charts/solid`        | Solid `>=1.8`                                                                   |
| `@tanstack/charts/svelte`       | Svelte `^5.20.0`                                                                |
| `@tanstack/charts/angular`      | Angular core and platform browser `>=19`                                        |
| `@tanstack/charts/lit`          | Lit `>=3.1.3`                                                                   |
| `@tanstack/charts/alpine`       | Alpine `>=3.15`                                                                 |
| `@tanstack/charts/octane`       | Octane `^0.1.13`                                                                |

Framework peers are optional at the package level because package managers
cannot scope peers to individual export subpaths. Install only the peers for
the selected adapter. Use the framework's normal renderer or application
package when the application needs browser mounting or server rendering.
