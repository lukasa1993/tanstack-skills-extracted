# SKILL — Cross-model compatibility notes

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Cross-model compatibility notes

This skill is designed to produce consistent results across Claude, GPT-4+,
Gemini, and open-source models. To achieve this:

- All instructions use imperative sentences, not suggestions
- Interview phases use explicit STOP gates to prevent models from
  continuing autonomously past interactive checkpoints
- Hard rules at the top override any model tendency to rationalize
  skipping interactive phases when documentation is available
- Open-ended questions are explicitly protected from conversion to
  multiple-choice or confirmation prompts, which models default to
  when they have enough context to pre-populate answers
- Output formats use YAML (universally parsed) and Markdown tables
  (universally rendered)
- Examples use concrete values, not placeholders like "[your value here]"
- Section boundaries use Markdown headers (##) for navigation and --- for
  phase separation
- No model-specific features (no XML tags in output, no tool_use assumptions)
