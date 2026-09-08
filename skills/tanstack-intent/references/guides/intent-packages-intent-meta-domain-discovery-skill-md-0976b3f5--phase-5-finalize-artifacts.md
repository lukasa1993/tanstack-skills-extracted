# SKILL — Phase 5 — Finalize artifacts

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Phase 5 — Finalize artifacts

Merge interview findings into the draft. For each interview answer:

1. If it confirms a skill or failure mode — no action needed
2. If it corrects something — update the map
3. If it adds a new failure mode — add it with source "maintainer interview"
4. If it reveals a new skill — add it
5. If it fills a gap — remove from gaps section

Validate the domain_map.yaml by parsing it with a YAML parser. Check for
duplicate keys, invalid syntax, and structural correctness. Fix any issues
before presenting the final artifact.

Update `status: draft` to `status: reviewed`.

---
