# Tooltips And Focus — Overview

[Guide and prerequisites](./charts-docs-guides-tooltips-and-focus-md-98d6a918.md) · Release-matched documentation · `@tanstack/charts@0.16.0`.

The DOM host provides a small automatic path for the common case:

- find the nearest chart point;
- draw a focus marker;
- show locale-aware text;
- expose the same point to pointer and keyboard users;
- notify typed application callbacks.

Use that path until the product needs richer interaction.
