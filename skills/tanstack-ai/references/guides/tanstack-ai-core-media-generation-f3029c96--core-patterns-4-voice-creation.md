# Media Generation — Core Patterns: 4. Voice Creation

[Guide and prerequisites](./tanstack-ai-core-media-generation-f3029c96.md) · Published skill · `@tanstack/ai@0.58.0`.

## Core Patterns: 4. Voice Creation


Adapter: `elevenlabsVoiceDesign` (`eleven_ttv_v3`, `eleven_multilingual_ttv_v2`).

`generateVoice()` makes a voice that does not exist in any catalog, either
from a text description or from a clip of a real speaker. It returns voice ids
you pass straight back to `generateSpeech()` as `voice`.

> Pass `prompt`, or `referenceAudio`, or both — the activity throws when
> neither is given. ElevenLabs always needs `prompt`, because its design
> endpoint requires a description, and only `eleven_ttv_v3` accepts
> `referenceAudio`. Without a `name` you get **previews**, which expire;
> with a `name` the best candidate is kept in the provider's voice library.
> Check `saved` on each returned voice rather than assuming. Remote audio
> URLs are rejected: read the file and pass bytes.

```typescript
import { generateSpeech, generateVoice } from '@tanstack/ai'
import {
  elevenlabsSpeech,
  elevenlabsVoiceDesign,
} from '@tanstack/ai-elevenlabs'

const designed = await generateVoice({
  adapter: elevenlabsVoiceDesign('eleven_ttv_v3'),
  prompt: 'A warm, gravelly narrator in his sixties with a slight Irish lilt',
  name: 'Irish Narrator', // omit to audition previews instead
})

const [voice] = designed.voices
if (!voice) throw new Error('The provider returned no voices.')

// voice.voiceId  -> pass to generateSpeech()
// voice.audio    -> base64 preview, when the provider returns one
// voice.saved    -> true only when it is in the provider's library
// voice.status   -> 'ready' on every adapter today

const speech = await generateSpeech({
  adapter: elevenlabsSpeech('eleven_v3'),
  text: 'Once upon a time...',
  voice: voice.voiceId,
})
```

**Status.** Every returned voice carries `status`. It is `'ready'` on every
adapter today, because they all finish the voice before returning. The
`'training'` and `'failed'` members exist for providers that build a voice
asynchronously; no adapter returns them yet, so do not write polling code
against them.

**Finding voices again.** `generateVoice()` hands back an id you are expected
to store. `listVoices({ adapter: <a TTS adapter>, origins })` reads the
account catalog back when you did not.

```typescript
import { listVoices } from '@tanstack/ai'
import { elevenlabsSpeech } from '@tanstack/ai-elevenlabs'

const { voices } = await listVoices({
  adapter: elevenlabsSpeech('eleven_v3'),
  origins: ['generated', 'cloned'],
})
```

`listVoices` hangs off the **TTS** adapter, not the voice adapter, because
`voice` is a `generateSpeech()` option — that is where the id gets consumed.
It is OPTIONAL, and only providers with a per-account catalog implement it.
Where the catalog is fixed the package publishes it instead — `GeminiTTSVoices`
from `@tanstack/ai-gemini`, or the `OpenAITTSVoice` union from
`@tanstack/ai-openai`. Prefer those: a type union beats a network call.
Calling `listVoices()` on such an adapter throws and points at them.

There is no React hook for this activity. Call it from a server route or
server function and return the result as JSON.

`elevenlabsVoiceDesign` is the only `generateVoice()` adapter in this repo.
xAI, BytePlus, and fal.ai each publish a voice-cloning API and are the
candidates for the next one, but none is implemented — do not write code
against them from this file.

OpenAI, Gemini, and Cloudflare have fixed voice catalogs and will not get one.
