# ADR 004: Split Card into Shell + variant components

**Status**: Accepted
**Date**: 2026-08-21

## Decision

Extract `CharaCardShell` as the layout primitive (green header + avatar slot + name column). Build `CharaCard` (display) and `CharaAdder` (add-form) as variants that inject content into that shell.

## Rationale

The card's outer frame is identical across display and add-form use cases; only the inner content differs (rendered image vs. file picker + input). Keeping the layout in one place prevents the two variants from drifting visually as the design evolves, and makes future variants (button, flipped, etc.) cheap to add.

## User feedback

User explicitly asked for this rename and split: Card → CharaCard, add form → CharaAdder, shared frame → CharaCardShell.
