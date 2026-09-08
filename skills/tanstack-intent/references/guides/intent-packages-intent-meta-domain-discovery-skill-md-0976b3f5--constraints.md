# SKILL — Constraints

[Guide and prerequisites](./intent-packages-intent-meta-domain-discovery-skill-md-0976b3f5.md) · Release-matched documentation · `@tanstack/intent@0.4.0`.

## Constraints

| Check                                 | Rule                                                                                                                                 |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Quick scan before interview           | Never interview without at least reading README and package structure                                                                |
| High-level interview before deep read | The maintainer's task map informs what you read deeply                                                                               |
| **Interview phases are interactive**  | Phases 2 and 4 require sending questions to the maintainer and waiting                                                               |
| **Docs are not a substitute**         | Documentation cannot replace maintainer answers — even comprehensive docs                                                            |
| **Open-ended questions stay open**    | Never convert interview questions to multiple-choice or yes/no                                                                       |
| **Minimum question counts enforced**  | Each sub-section's minimum count must be met; zero questions = violation                                                             |
| **STOP gates are mandatory**          | Do not proceed past a STOP gate without maintainer response                                                                          |
| Batch only confirmations              | Yes/no questions may batch 2–3; open-ended questions get their own message                                                           |
| Questions reference findings          | No generic questions — cite what you found                                                                                           |
| Skills are task-focused               | Each skill matches a developer moment, not a conceptual area                                                                         |
| 3+ failure modes per skill            | Complex skills target 5–6                                                                                                            |
| Every failure mode sourced            | Doc page, source file, issue link, or maintainer interview                                                                           |
| Gaps are explicit                     | Unknown areas flagged, not guessed                                                                                                   |
| No marketing prose                    | Library description is factual, not promotional                                                                                      |
| domain_map.yaml is valid YAML         | Parseable by any YAML parser                                                                                                         |
| Draft before detail interview         | Present draft for review before Phase 4                                                                                              |
| **Draft reviewed before Phase 4**     | Maintainer must acknowledge or respond to draft before detail interview                                                              |
| Agent-specific failures probed        | Always ask AI-agent-specific questions in Phase 4c                                                                                   |
| Compositions discovered from code     | Scan peer deps and examples before asking composition questions                                                                      |
| Cross-skill failure modes tagged      | Failure modes spanning skills list all relevant slugs                                                                                |
| Tensions identified                   | 2–4 cross-skill tensions; if none found, revisit skill boundaries                                                                    |
| Subsystems flagged                    | Skills with 3+ adapters/backends list them as subsystems                                                                             |
| Dense surfaces flagged                | Topics with >10 patterns noted as reference_candidates                                                                               |
| Lifecycle skills considered           | Suggest journey skills when docs have the material                                                                                   |
| Cross-references mapped               | Skills that illuminate each other get "See also" pointers                                                                            |
| **Documentation coverage**            | Read all local narrative files; document external sampling under the [Phase 3 reading policy](https://github.com/TanStack/intent/blob/bffcdabbdb9a55af5a3ba1ff09ece0f7da223eb2/packages/intent/meta/domain-discovery/references/deep-read.md#reading-order) |

---
