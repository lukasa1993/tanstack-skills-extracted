# Sensible Defaults — Sequences allow 1 second between steps

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.17.0`.

## Sequences allow 1 second between steps

A sequence such as `['G', 'G']` completes when each step follows the previous one within 1 second. One second is long enough for deliberate typing and short enough that two unrelated key presses rarely combine. Change it with `timeout`.

Sequences are forgiving in a few other ways:

- **Pressing a modifier alone does not interrupt a sequence**, so steps can include modifiers: `['Shift+R', 'Shift+T']`.
- **Automatic repeats are not steps.** Holding `G` does not complete `['G', 'G']`.
- **A wrong key restarts the sequence.** If the wrong key is the sequence's first step, it begins a new attempt, so `G X G G` still completes `['G', 'G']`.
- **Progress clears when the timeout passes**, without waiting for another key press, so a UI that shows the pressed steps clears on time.
