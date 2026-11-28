# Sensible Defaults — Sequences allow 1 second between steps

[Guide and prerequisites](./hotkeys-docs-guides-sensible-defaults-md-d1106b45.md) · Release-matched documentation · `@tanstack/hotkeys@0.38.0`.

## Sequences allow 1 second between steps

A sequence like `['G', 'G']` completes when each step arrives within `1000` ms (`timeout`). While a sequence is in progress:

- Pressing a standalone modifier (`Shift`) doesn't break the sequence, so `['Shift+R', 'Shift+T']` works naturally.
- Lock keys (`CapsLock`, `NumLock`), `Fn`, and dead keys don't reset progress unless they match a step of another sequence.
- Key auto-repeat doesn't count as a second step. Holding `G` won't trigger `['G', 'G']`.
- Pressing a wrong key clears progress, unless that key starts the sequence. In that case it begins a fresh attempt, so `G X G G` still fires `['G', 'G']`.
- Progress clears automatically when the timeout expires, so UI indicators disappear on time.
