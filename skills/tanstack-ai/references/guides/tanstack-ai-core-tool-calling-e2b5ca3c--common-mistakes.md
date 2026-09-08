# Tool Calling — Common Mistakes

[Guide and prerequisites](./tanstack-ai-core-tool-calling-e2b5ca3c.md) · Published skill · `@tanstack/ai@0.53.0`.

## Common Mistakes

### a. HIGH: Not passing tool definitions to both server and client

Server tools need `chat({ tools })`. Client tools need their definition in
`chat({ tools })` AND their `.client()` in `useChat({ tools: clientTools(...) })`.

Wrong -- tool only on server, client cannot execute:

```typescript
chat({ adapter, messages, tools: [myToolDef] })
useChat({ connection: fetchServerSentEvents('/api/chat') }) // no tools
```

Wrong -- tool only on client, LLM does not know about it:

```typescript
chat({ adapter, messages }); // no tools
useChat({ ..., tools: clientTools(myToolDef.client(() => result)) });
```

Correct:

```typescript
chat({ adapter, messages, tools: [myToolDef] });
useChat({ ..., tools: clientTools(myToolDef.client((input) => ({ success: true }))) });
```

Source: docs/tools/tools.md
