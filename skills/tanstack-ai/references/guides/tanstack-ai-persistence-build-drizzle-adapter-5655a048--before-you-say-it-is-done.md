# Build Drizzle Adapter — Before you say it is done

[Guide and prerequisites](./tanstack-ai-persistence-build-drizzle-adapter-5655a048.md) · Published skill · `@tanstack/ai-persistence@1.0.1`.

## Before you say it is done

- The schema file has all four tables: threads, runs, interrupts, metadata.
- `chat-persistence.ts` has all four store factories and passes all four to
  `defineAIPersistence`.
- The export is annotated `ChatPersistence`.
- The conformance suite in step 5 runs green on the app's dialect.
