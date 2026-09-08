# Structured Outputs — Core Patterns: Pattern 1: Basic structured output with Zod

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: Pattern 1: Basic structured output with Zod


```typescript
import { chat } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { z } from 'zod'

const PersonSchema = z.object({
  name: z.string().meta({ description: "The person's full name" }),
  age: z.number().meta({ description: "The person's age in years" }),
  email: z.string().email().meta({ description: 'Email address' }),
})

// chat() returns Promise<{ name: string; age: number; email: string }>
const person = await chat({
  adapter: openaiText('gpt-5.2'),
  messages: [
    {
      role: 'user',
      content:
        'Extract the person info: John Doe is 30 years old, email john@example.com',
    },
  ],
  outputSchema: PersonSchema,
})

console.log(person.name) // "John Doe"
console.log(person.age) // 30
console.log(person.email) // "john@example.com"
```
