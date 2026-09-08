# Server Functions — Input Validation

[Guide and prerequisites](./tanstack-start-client-core-start-core-server-functions-49d113b0.md) · Published skill · `@tanstack/start-client-core@1.170.28`.

## Input Validation

### Basic Validator

```tsx
const greetUser = createServerFn({ method: 'GET' })
  .validator((data: { name: string }) => data)
  .handler(async ({ data }) => {
    return `Hello, ${data.name}!`
  })

await greetUser({ data: { name: 'John' } })
```

### Zod Validator

```tsx
import { z } from 'zod'

const createUser = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      name: z.string().min(1),
      age: z.number().min(0),
    }),
  )
  .handler(async ({ data }) => {
    return `Created user: ${data.name}, age ${data.age}`
  })
```

Input validation does not validate output serialization. When a response schema changes, update the database selection, service return value, server-function result, loader consumer, and UI. Add a runtime test that calls the handler or HTTP boundary and asserts the new field in the returned payload.

### FormData

```tsx
const submitForm = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData')
    }
    return {
      name: data.get('name')?.toString() || '',
      email: data.get('email')?.toString() || '',
    }
  })
  .handler(async ({ data }) => {
    return { success: true }
  })
```
