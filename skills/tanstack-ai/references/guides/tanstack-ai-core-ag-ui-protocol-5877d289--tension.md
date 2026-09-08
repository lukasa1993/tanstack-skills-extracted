# Ag Ui Protocol — Tension

[Guide and prerequisites](./tanstack-ai-core-ag-ui-protocol-5877d289.md) · Published skill · `@tanstack/ai@0.53.0`.

## Tension

RESOLVED: TanStack AI is fully AG-UI compliant on both axes (server→client events
AND client→server `RunAgentInput`). The wire format carries TanStack `UIMessage`
anchors with their parts intact alongside AG-UI fan-out messages, so strict AG-UI
servers see role-based messages while TanStack-aware servers read parts directly
without transformation. See `docs/migration/ag-ui-compliance.md` for details.
