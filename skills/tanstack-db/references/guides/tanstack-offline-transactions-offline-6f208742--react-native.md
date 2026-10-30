# Offline — React Native

[Guide and prerequisites](./tanstack-offline-transactions-offline-6f208742.md) · Published skill · `@tanstack/offline-transactions@1.2.0`.

## React Native

```ts
import {
  startOfflineExecutor,
} from '@tanstack/offline-transactions/react-native'

// Uses ReactNativeOnlineDetector automatically
// Uses AsyncStorage-compatible storage
const executor = startOfflineExecutor({ ... })
```
