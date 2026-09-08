# SKILL — Phase 1 — Quick scan (autonomous, ~10 minutes)

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Phase 1 — Quick scan (autonomous, ~10 minutes)

Orient yourself in the library. You are building a structural map, not
reading exhaustively yet.

### 1a — Read orientation material

1. **README** — vocabulary, mental model, what the library does
2. **Getting started / quickstart** — the happy path
3. **Package structure** — if monorepo, identify which packages are
   client-facing vs internal. Focus on the 2–3 packages most relevant
   to skill consumers (usually client SDKs and primary framework adapters)
4. **AGENTS.md or .cursorrules** — if the library already has agent
   guidance, read it. This is high-signal for what the maintainer
   considers important
5. **All in-repo documentation** — list every `.md` file in the `docs/`
   directory (and any other documentation directories like `guides/`,
   `reference/`, `wiki/`). Read every file. This is NOT the exhaustive
   external doc reading from Phase 3 — this is reading what the
   maintainer committed to the repository, which is fast and
   high-signal. In-repo docs often contain migration guides, backward
   compatibility notes, architecture decisions, and other context that
   prevents you from asking factual questions the docs already answer.
   Do not sample a subset — read them all before the first interview.

### 1b — Read peer dependency constraints

Check `package.json` for `peerDependencies` and `peerDependenciesMeta`.
For each major peer dependency (React, Vue, Svelte, Next.js, etc.):

1. Note the version range required
2. Read the peer's docs for integration constraints that affect this
   library: SSR/hydration rules, component lifecycle boundaries,
   browser-only APIs, singleton patterns, connection limits
3. Log framework-specific failure modes — these are the highest-impact
   failure modes and cannot be discovered from the library's own source

Examples of peer-dependency-driven failure modes:

- SSR: calling browser-only APIs during server render
- React: breaking hook rules in library wrapper components
- Connection limits: opening multiple WebSocket connections per tab
- Singleton patterns: creating multiple client instances in dev mode

### 1c — Note initial impressions

Log (but do not group yet):

- What the library does in one sentence
- The core abstractions a developer interacts with
- Which frameworks it supports
- Any existing skill files, agent configs, or intents
- Whether the library is a monorepo and which packages matter
- Peer dependency constraints — read `peerDependencies` and
  `peerDependenciesMeta` from each client-facing package.json to
  understand version ranges and optional integrations early

Present your initial impressions to the maintainer as a brief summary
(3–5 bullets). This orients them on what you found and primes them for
the interview.

**── STOP ── Do not proceed to Phase 2 until the maintainer has
acknowledged your summary or responded.**

---
