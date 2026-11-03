# Installation — React Native and Expo

[Guide and prerequisites](./charts-docs-installation-md-6ab2967d.md) · Release-matched documentation · `@tanstack/charts@1.2.1`.

## React Native and Expo

The React Native adapter is experimental and renders through
`react-native-svg`. Expo 57 and 58 applications can install the package and the SVG
version selected by Expo:

```sh
pnpm add @tanstack/charts
pnpm exec expo install react-native-svg
```

Bare React Native 0.86 and 0.88 applications install the renderer directly:

```sh
pnpm add @tanstack/charts react react-native react-native-svg@^15.15.4
```

Run `bundle exec pod install` from `ios/` after adding it to a bare iOS
application. Metro does not reliably remove unused exports from a large barrel,
so import exact chart capabilities and choose the native host explicitly:

```tsx
import { lineY } from '@tanstack/charts/line'
import { defineChart } from '@tanstack/charts/scene'
import { Chart } from '@tanstack/charts/react-native'
import { tooltip } from '@tanstack/charts/react-native/tooltip'
```

Packed tarballs are typechecked and bundled through default bare React Native
and Expo Metro configurations on iOS and Android. The current fixtures cover
bare React Native 0.86.2 and Expo 58 with React Native 0.88.0. The earlier Expo
57 fixture rendered in Expo Go on an iOS simulator; Expo 58 has not yet been
verified on a simulator or device. Native responder and
accessibility cursor behavior has component regression coverage. Bare-native
and Android simulator runs, physical devices, visual parity, and screen-reader
verification are not currently part of the release gate.
