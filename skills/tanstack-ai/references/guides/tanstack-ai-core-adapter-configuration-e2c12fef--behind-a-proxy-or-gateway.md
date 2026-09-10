# Adapter Configuration — Behind a proxy or gateway

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

## Behind a proxy or gateway

Every adapter's client config accepts `baseURL` and `defaultHeaders`. Use these
two names to route any adapter through Cloudflare AI Gateway, Vercel AI Gateway,
or a corporate proxy. The adapter maps them onto the vendor SDK's own option
names (Gemini `httpOptions`, Mistral `serverURL`, Ollama `host`, Cohere and
ElevenLabs `baseUrl`/`headers`). The vendor names still work; when both are
set, `baseURL` and `defaultHeaders` win.

```typescript
import { createGeminiChat } from '@tanstack/ai-gemini'

const gateway = {
  baseURL: 'https://gateway.example.com/google-ai-studio',
  defaultHeaders: {
    'cf-aig-authorization': `Bearer ${process.env.GATEWAY_TOKEN}`,
  },
}
createGeminiChat('gemini-3.8-flash', process.env.GOOGLE_API_KEY!, {
  ...gateway,
})
```
