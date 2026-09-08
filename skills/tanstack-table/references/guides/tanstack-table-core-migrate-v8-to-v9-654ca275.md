# Migrate V8 To V9

<a id="source-tanstack-table-core-migrate-v8-to-v9"></a>

Published skill · `@tanstack/table-core@9.2.4`.

[Topic index](../advanced.md) · [Source provenance](../SOURCES.md)

Prerequisite: [Core](./tanstack-table-core-e5f4d128.md).
Prerequisite: [Table Features](./tanstack-table-core-table-features-d2215548.md).
Prerequisite: [Typescript](./tanstack-table-core-typescript-aaac5f64.md).

## Choose a section

Read the overview or setup when it is a prerequisite, then the section needed for the task.

- [Overview](./tanstack-table-core-migrate-v8-to-v9-654ca275--overview.md) — 1 KiB
- [Migration strategy](./tanstack-table-core-migrate-v8-to-v9-654ca275--migration-strategy.md) — 1 KiB
- [Minimal v9 shape](./tanstack-table-core-migrate-v8-to-v9-654ca275--minimal-v9-shape.md) — 1 KiB
- [Complete shared breaking-change inventory: 1. Register every non-core feature explicitly](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-1-register-every-non-core-feature-explicitly.md) — 3 KiB
- [Complete shared breaking-change inventory: 2. Move row models into feature slots and rename factories](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-2-move-row-models-into-feature-slots-and-rename-factories.md) — 5 KiB
- [Complete shared breaking-change inventory: 3. Migrate state reads and whole-state observation](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-3-migrate-state-reads-and-whole-state-observation.md) — 2 KiB
- [Complete shared breaking-change inventory: 4. Keep instance methods bound](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-4-keep-instance-methods-bound.md) — 1 KiB
- [Complete shared breaking-change inventory: 5. Replace physical column pinning with logical pinning](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-5-replace-physical-column-pinning-with-logical-pinning.md) — 3 KiB
- [Complete shared breaking-change inventory: 6. Split column sizing from resizing](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-6-split-column-sizing-from-resizing.md) — 1 KiB
- [Complete shared breaking-change inventory: 7. Rename sorting APIs](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-7-rename-sorting-apis.md) — 1 KiB
- [Complete shared breaking-change inventory: 8. Split the table-level pinning switch](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-8-split-the-table-level-pinning-switch.md) — 1 KiB
- [Complete shared breaking-change inventory: 9. Remove internal APIs and use public surfaces](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-9-remove-internal-apis-and-use-public-surfaces.md) — 2 KiB
- [Complete shared breaking-change inventory: 10. Update row-selection predicates](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-10-update-row-selection-predicates.md) — 1 KiB
- [Complete shared breaking-change inventory: 11. Update TypeScript feature generics and helpers](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-11-update-typescript-feature-generics-and-helpers.md) — 2 KiB
- [Complete shared breaking-change inventory: 12. Migrate adapter construction and rendering separately](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-shared-breaking-change-inventory-12-migrate-adapter-construction-and-rendering-separately.md) — 1 KiB
- [Optional v9 adoption after parity](./tanstack-table-core-migrate-v8-to-v9-654ca275--optional-v9-adoption-after-parity.md) — 1 KiB
- [Complete audit checklist](./tanstack-table-core-migrate-v8-to-v9-654ca275--complete-audit-checklist.md) — 4 KiB
- [Common migration failures](./tanstack-table-core-migrate-v8-to-v9-654ca275--common-migration-failures.md) — 2 KiB
- [Installed API discovery](./tanstack-table-core-migrate-v8-to-v9-654ca275--installed-api-discovery.md) — 1 KiB

<!-- Original source anchors retained for inbound links. -->
<a id="migration-strategy"></a>
<a id="minimal-v9-shape"></a>
<a id="complete-shared-breaking-change-inventory"></a>
<a id="1-register-every-non-core-feature-explicitly"></a>
<a id="2-move-row-models-into-feature-slots-and-rename-factories"></a>
<a id="3-migrate-state-reads-and-whole-state-observation"></a>
<a id="4-keep-instance-methods-bound"></a>
<a id="5-replace-physical-column-pinning-with-logical-pinning"></a>
<a id="6-split-column-sizing-from-resizing"></a>
<a id="7-rename-sorting-apis"></a>
<a id="8-split-the-table-level-pinning-switch"></a>
<a id="9-remove-internal-apis-and-use-public-surfaces"></a>
<a id="10-update-row-selection-predicates"></a>
<a id="11-update-typescript-feature-generics-and-helpers"></a>
<a id="12-migrate-adapter-construction-and-rendering-separately"></a>
<a id="optional-v9-adoption-after-parity"></a>
<a id="complete-audit-checklist"></a>
<a id="common-migration-failures"></a>
<a id="critical-silencing-a-missing-api-instead-of-registering-its-feature"></a>
<a id="critical-mixing-v8-and-v9-configuration-styles"></a>
<a id="high-treating-stockfeatures-or-uselegacytable-as-the-finished-migration"></a>
<a id="high-copying-one-adapters-state-or-rendering-api-into-another"></a>
<a id="installed-api-discovery"></a>
