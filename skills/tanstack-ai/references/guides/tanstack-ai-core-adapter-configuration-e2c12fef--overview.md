# Adapter Configuration — Overview

[Guide and prerequisites](./tanstack-ai-core-adapter-configuration-e2c12fef.md) · Published skill · `@tanstack/ai@0.54.0`.

# Adapter Configuration

> **Dependency:** This skill builds on ai-core. Read it first for critical rules.

> **Before implementing:** Ask the user which provider and model they want.
> Then fetch the latest available models from the provider's source code
> (check the adapter's model metadata file, e.g. `packages/ai-openai/src/model-meta.ts`)
> or from the provider's API/docs to recommend the most current model.
> The model lists in this skill and its reference files may be outdated.
> Always verify against the source before recommending a specific model.
