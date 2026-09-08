# Structured Outputs — Core Patterns: Pattern 2: Complex nested schemas

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Core Patterns: Pattern 2: Complex nested schemas


```typescript
import { chat } from '@tanstack/ai'
import { anthropicText } from '@tanstack/ai-anthropic'
import { z } from 'zod'

const CompanySchema = z.object({
  name: z.string(),
  founded: z.number().meta({ description: 'Year the company was founded' }),
  headquarters: z.object({
    city: z.string(),
    country: z.string(),
    address: z.string().optional(),
  }),
  employees: z.array(
    z.object({
      name: z.string(),
      role: z.string(),
      department: z.string(),
    }),
  ),
  financials: z
    .object({
      revenue: z
        .number()
        .meta({ description: 'Annual revenue in millions USD' }),
      profitable: z.boolean(),
    })
    .optional(),
})

const company = await chat({
  adapter: anthropicText('claude-sonnet-4-5'),
  messages: [
    {
      role: 'user',
      content: 'Extract company info from this article: ...',
    },
  ],
  outputSchema: CompanySchema,
})

// Full type safety on nested properties
console.log(company.headquarters.city)
console.log(company.employees[0].role)
console.log(company.financials?.revenue)
```
