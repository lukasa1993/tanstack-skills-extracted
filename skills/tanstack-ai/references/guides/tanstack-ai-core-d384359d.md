# Ai Core

<a id="source-tanstack-ai-core"></a>

Published skill · `@tanstack/ai@0.54.0`.

[Topic index](../chat-providers.md) · [Source provenance](../SOURCES.md)

# TanStack AI — Core Concepts

TanStack AI is a type-safe, provider-agnostic AI SDK. Server-side functions
live in `@tanstack/ai` and provider adapter packages. Client-side hooks live
in framework packages (`@tanstack/ai-react`, `@tanstack/ai-solid`, etc.).
Always import from the framework package on the client — never from
`@tanstack/ai-client` directly (unless vanilla JS).

## Sub-Skills

| Need to...                                        | Read                                          |
| ------------------------------------------------- | --------------------------------------------- |
| Build a chat UI with streaming                    | ./tanstack-ai-core-chat-experience-6cd3502a.md#source-tanstack-ai-core-chat-experience              |
| Survive a browser reload (no extra package)       | ./tanstack-ai-core-client-persistence-9ee3012c.md#source-tanstack-ai-core-client-persistence           |
| Add tool calling (server, client, or both)        | ./tanstack-ai-core-tool-calling-e2b5ca3c.md#source-tanstack-ai-core-tool-calling                 |
| Generate images, video, speech, or transcriptions | ./tanstack-ai-core-media-generation-f3029c96.md#source-tanstack-ai-core-media-generation             |
| Get typed JSON responses from the LLM             | ./tanstack-ai-core-structured-outputs-fef450ef.md#source-tanstack-ai-core-structured-outputs           |
| Choose and configure a provider adapter           | ./tanstack-ai-core-adapter-configuration-e2c12fef.md#source-tanstack-ai-core-adapter-configuration        |
| Implement AG-UI streaming protocol server-side    | ./tanstack-ai-core-ag-ui-protocol-5877d289.md#source-tanstack-ai-core-ag-ui-protocol               |
| Add analytics, logging, or lifecycle hooks        | ./tanstack-ai-core-middleware-b87affa9.md#source-tanstack-ai-core-middleware                   |
| Coordinate multi-instance work with locks         | ./tanstack-ai-core-locks-b6cb9694.md#source-tanstack-ai-core-locks                        |
| Connect to a non-TanStack-AI backend              | ./tanstack-ai-core-custom-backend-integration-0c016192.md#source-tanstack-ai-core-custom-backend-integration   |
| Turn on/off debug logging, pipe into pino/winston | ./tanstack-ai-core-debug-logging-12e2d18d.md#source-tanstack-ai-core-debug-logging                |
| Persist chats server-side (history, runs)         | See `@tanstack/ai-persistence` package skills |
| Set up Code Mode (LLM code execution)             | See `@tanstack/ai-code-mode` package skills   |
| Give the model a catalog of SKILL.md skills       | See `@tanstack/ai-skills` package skills      |

## Companion packages

Some capabilities live in their own package and ship their own skills. Install
the package, then read its skills — do not guess the API from this file.

### `@tanstack/ai-persistence` — durable chat state

Makes a conversation survive a reload, a server restart, a second device, or a
paused tool approval. It ships the **store contracts** (`MessageStore`,
`RunStore`, `InterruptStore`, `MetadataStore`), the `withPersistence` /
`withGenerationPersistence` middleware, `reconstructChat` for server-side
hydrate, an in-memory reference backend, and a conformance testkit. Multi-instance
locks are **not** in this package — `LockStore` / `withLocks` ship in
`@tanstack/ai/locks`; see ai-core/locks. The `runs` store contract is typed
against run lifecycle types (`RunStatus`, `RunRecord`, `RunStore`,
`defineRunStore`, `InMemoryRunStore`), which ship in `@tanstack/ai` itself;
see ai-core/middleware.

It does **not** ship a backend for your database — you implement the stores
against Postgres, SQLite, D1, Mongo, or whatever you run, and the package's
skills walk you through it (including Drizzle, Prisma, and Cloudflare recipes).

```bash
pnpm add @tanstack/ai-persistence
npx @tanstack/intent@latest install
```

The skills ship **inside** the package, so they only exist on disk once it is
installed — the second command re-scans `node_modules` and wires them into the
agent config. Until then the paths below resolve to nothing.

Entry point: `./tanstack-ai-persistence-2fec28cd.md#source-tanstack-ai-persistence`

| Need to...                                      | Read                                    |
| ----------------------------------------------- | --------------------------------------- |
| Wire server-side chat history, runs, interrupts | ./tanstack-ai-persistence-server-3b558cfc.md#source-tanstack-ai-persistence-server          |
| Implement the store interfaces for your DB      | ./tanstack-ai-persistence-stores-e6061122.md#source-tanstack-ai-persistence-stores          |
| Write the adapter for the DB your app runs      | ../persistence-adapters.md |

Browser-side persistence is **not** in this package — it ships with the
framework packages, so read **ai-core/client-persistence** instead.

### `@tanstack/ai-code-mode` — LLM code execution

See the `ai-code-mode` skill in that package.

### `@tanstack/ai-skills` — portable Agent Skills at runtime

Gives the model a library of `SKILL.md` skills it can load on demand, on any
provider, via the `withSkills` middleware and a `load_skill` tool. Skills come
from `inlineSkill`, `skillDirectory`, or a build-time bundle. This is the
runtime feature for the model **inside your app**, not the coding-assistant
skills this file is part of, and not the hosted `codeExecutionTool` /
`shellTool` skills (those run in a provider sandbox).

```bash
pnpm add @tanstack/ai-skills
npx @tanstack/intent@latest install
```

Entry point: `./tanstack-ai-skills-f9e7226a.md#source-tanstack-ai-skills`

## Quick Decision Tree

- Setting up a chatbot? → ai-core/chat-experience
- Adding function calling? → ai-core/tool-calling
- Generating media (images, audio, video)? → ai-core/media-generation
- Need structured JSON output? → ai-core/structured-outputs
- Choosing/configuring a provider? → ai-core/adapter-configuration
- Building a server-only AG-UI backend? → ai-core/ag-ui-protocol
- Adding analytics or post-stream events? → ai-core/middleware
- Surviving reloads / multi-device / durable approvals? → `@tanstack/ai-persistence` skills
- Connecting to a custom backend? → ai-core/custom-backend-integration
- Turning on debug logging to trace chunks/tools/middleware? → ai-core/debug-logging
- Debugging mistakes? → Check Common Mistakes in the relevant sub-skill

## Critical Rules

1. **This is NOT the Vercel AI SDK.** Use `chat()` not `streamText()`. Use `openaiText()` not `createOpenAI()`. Import from `@tanstack/ai`, not `ai`.
2. **Import from framework package on client.** Use `@tanstack/ai-react` (or solid/vue/svelte/preact), not `@tanstack/ai-client`.
3. **Use `toServerSentEventsResponse()`** to convert streams to HTTP responses. Never implement SSE manually.
4. **Use middleware for lifecycle events.** No `onEnd`/`onFinish` callbacks on `chat()` — use `middleware: [{ onFinish: ... }]`.
5. **Ask the user which adapter and model** they want. Suggest the latest model. Also ask if they want Code Mode.
6. **Tools must be passed to both server and client.** Server gets the tool in `chat({ tools })`; the client passes the `.client()` implementation through the `clientTools()` helper into the **`tools`** option — `useChat({ tools: clientTools(myTool.client(...)) })`. There is no `clientTools` option. See ai-core/tool-calling.

## Version

Targets TanStack AI v0.42.0.
