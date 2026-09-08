# Structured Outputs — Decision: which pattern fits

[Guide and prerequisites](./tanstack-ai-core-structured-outputs-fef450ef.md) · Published skill · `@tanstack/ai@0.53.0`.

## Decision: which pattern fits

| Building this                                                                                  | Use                                                              |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| One prompt in → one typed object out (script, server endpoint, CLI)                            | Pattern 1 (basic) or 2 (nested)                                  |
| A UI that fills in field by field as the model streams (progressive form, live card)           | Pattern 4 — `useChat({ outputSchema })`                          |
| Direct iteration of the stream in Node or tests                                                | Pattern 3 — async iterable                                       |
| Users iterate on a structured object across multiple turns (recipe builder, ticket refinement) | Pattern 5 — multi-turn structured chat                           |
| Tools that gather info, then return a typed object                                             | Combine any of the above with `tools` — see ai-core/tool-calling |
| A coding agent in a sandbox inspects files, then returns a typed object                        | Pattern 6 — harness `outputSchema`                               |
