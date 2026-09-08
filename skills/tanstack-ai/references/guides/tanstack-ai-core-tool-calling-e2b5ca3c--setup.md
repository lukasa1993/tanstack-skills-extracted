# Tool Calling — Setup

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.53.0`.

## Setup

Complete end-to-end example: shared definition, server tool, client tool, server route, React client.

```typescript
// tools/definitions.ts
import { toolDefinition } from '@tanstack/ai'
import { z } from 'zod'

export const getProductsDef = toolDefinition({
  name: 'get_products',
  description: 'Search for products in the catalog',
  inputSchema: z.object({
    query: z.string().meta({ description: 'Search keyword' }),
    limit: z.number().optional().meta({ description: 'Max results' }),
  }),
  outputSchema: z.object({
    products: z.array(
      z.object({ id: z.string(), name: z.string(), price: z.number() }),
    ),
  }),
})

export const updateCartUIDef = toolDefinition({
  name: 'update_cart_ui',
  description: 'Update the shopping cart UI with item count',
  inputSchema: z.object({ itemCount: z.number(), message: z.string() }),
  outputSchema: z.object({ displayed: z.boolean() }),
})
```

```typescript
// tools/server.ts
import { getProductsDef } from './definitions'

export const getProducts = getProductsDef.server(async ({ query, limit }) => {
  const results = await db.products.search(query, { limit: limit ?? 10 })
  return {
    products: results.map((p) => ({ id: p.id, name: p.name, price: p.price })),
  }
})
```

```typescript
// api/chat/route.ts
import { chat, toServerSentEventsResponse } from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { getProducts } from '@/tools/server'
import { updateCartUIDef } from '@/tools/definitions'

export async function POST(request: Request) {
  const { messages } = await request.json()
  const stream = chat({
    adapter: openaiText('gpt-5.5'),
    messages,
    tools: [getProducts, updateCartUIDef], // server tool + client definition
  })
  return toServerSentEventsResponse(stream)
}
```

```typescript
// app/chat.tsx
import {
  useChat,
  fetchServerSentEvents,
  clientTools,
  createChatClientOptions,
  type InferChatMessages,
} from "@tanstack/ai-react";
import { updateCartUIDef } from "@/tools/definitions";
import { useState } from "react";

function ChatPage() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartUI = updateCartUIDef.client((input) => {
    setCartCount(input.itemCount);
    return { displayed: true };
  });

  const tools = clientTools(updateCartUI);
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents("/api/chat"),
    tools,
  });
  const { messages, sendMessage } = useChat(chatOptions);
  // InferChatMessages ties part types to the configured tools when needed:
  // type Messages = InferChatMessages<typeof chatOptions>

  return (
    <div>
      <span>Cart: {cartCount}</span>
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.parts.map((part) => {
            if (part.type === "text") return <p>{part.content}</p>;
            if (part.type === "tool-call") {
              return <div key={part.id}>Tool: {part.name} ({part.state})</div>;
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
```
