# Build Cloudflare Adapter — 6. Wire it into the chat route

[Guide and prerequisites](./tanstack-ai-persistence-build-cloudflare-adapter-64163c5a.md) · Published skill · `@tanstack/ai-persistence@0.5.6`.

## 6. Wire it into the chat route

```ts ignore
import {
  chat,
  chatParamsFromRequest,
  toServerSentEventsResponse,
} from '@tanstack/ai'
import { openaiText } from '@tanstack/ai-openai'
import { withPersistence } from '@tanstack/ai-persistence'
import { chatPersistence } from './lib/chat-persistence'

export default {
  async fetch(request: Request, env: Env) {
    const params = await chatParamsFromRequest(request)
    const stream = chat({
      adapter: openaiText('gpt-5.5'),
      messages: params.messages,
      threadId: params.threadId,
      runId: params.runId,
      ...(params.resume ? { resume: params.resume } : {}),
      middleware: [withPersistence(chatPersistence(env.DB))],
    })
    return toServerSentEventsResponse(stream)
  },
}
```

`threadId` is a bare string to the stores. **Authorize thread access at the
route** — derive the user from the session, never trust a client-supplied id.
