# Server Functions — Basic Usage

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.29`.

## Basic Usage

```tsx
import { createServerFn } from '@tanstack/react-start'

// GET (default)
const getData = createServerFn().handler(async () => {
  return { message: 'Hello from server!' }
})

// POST
const saveData = createServerFn({ method: 'POST' }).handler(async () => {
  return { success: true }
})
```
