# Migrate V8 To V9 — Common Migration Failures

[Guide and prerequisites](./tanstack-lit-table-migrate-v8-to-v9-f7e7e2fd.md) · Published skill · `@tanstack/lit-table@9.2.4`.

## Common Migration Failures

### CRITICAL: Keeping the v8 controller shape

The controller constructor takes only the host in v9. Pass options to `.table(...)` while rendering.

### HIGH: Recreating the controller in render

Keep one stable controller field so subscriptions and host lifecycle remain attached.

### HIGH: Leaving row models on table options

Move each row model beside its prerequisite feature in `tableFeatures`.

### HIGH: Unstable table.subscribe selector

Define the selector as a class field or outside render to prevent avoidable update churn.

### HIGH: Destructuring instance methods

Use `row.getValue('name')`; prototype methods require the original instance and are absent from shallow clones.
