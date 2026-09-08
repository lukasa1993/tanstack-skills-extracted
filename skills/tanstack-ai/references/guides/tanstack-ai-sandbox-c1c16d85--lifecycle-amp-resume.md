# Ai Sandbox — Lifecycle &amp; resume

[Guide and prerequisites](./tanstack-ai-sandbox-c1c16d85.md) · Published skill · `@tanstack/ai-sandbox@0.5.6`.

## Lifecycle &amp; resume

`reuse: 'thread'` resumes one sandbox per `threadId`; the compound key folds in
provider + workspace hash + tenant so changing the repo/setup/image starts
fresh. Ensure order: resume running → restore snapshot → create + bootstrap.
