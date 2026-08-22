# ADR 002: aspect-ratio over height % for proportional scaling

**Status**: Accepted
**Date**: 2026-08-21

## Decision

To keep a child element proportional as its container shrinks, set CSS `aspect-ratio` (e.g. `aspect-[80/340]`) directly on the element instead of driving its height with a percentage like `h-[25%]`.

## Rationale

`height: 25%` breaks proportion when sibling elements have fixed intrinsic sizes that don't shrink alongside the parent — the fixed siblings eat vertical space and the "%-child" no longer matches its width-based ratio. `aspect-ratio` on the element itself makes height a pure function of the element's own width, so it stays proportional regardless of what siblings do.

## User feedback

User reported: "the thing is the porpotion is not keeping when the screen shrinks with this method" after trying `h-[25%]`. Switching to `aspect-ratio` on the element solved it.
