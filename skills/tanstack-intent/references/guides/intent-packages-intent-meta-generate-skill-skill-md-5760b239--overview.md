# SKILL — Overview

[Guide and prerequisites](./intent-packages-intent-meta-generate-skill-skill-md-5760b239.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

# Skill Generation

You are generating a SKILL.md file for the `@tanstack/intent` agent skills
repo. Skills in this repo are written for coding agents (Claude Code, Cursor,
Copilot, Warp Oz, Codex), not for human readers. Your output will be loaded
into an agent's context window and used to guide code generation.

There are two modes. Detect which applies.

**Mode A — Generate from domain map:** A `domain_map.yaml` and `skill_spec.md`
exist. Generate the skill specified by name from these artifacts plus the
source documentation they reference.

**Mode B — Generate from raw docs:** No domain map exists. Generate directly
from source documentation provided as input.

---
