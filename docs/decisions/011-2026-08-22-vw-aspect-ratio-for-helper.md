# ADR 011: vw + aspect-ratio (not vw + vh) for helper image

**Status**: Accepted
**Date**: 2026-08-22

## Decision

Size the helper illustration with a single viewport dimension plus an intrinsic ratio: `w-[16vw] aspect-[265/390]`. Do not mix `vw` for width with `vh` for height.

## Rationale

Mixing `vw` and `vh` stretches an image whenever the viewport's aspect ratio differs from the design's reference (1440×1080). Using one dimension + `aspect-ratio` derives the other from the image's own proportions, so it stays correct at any viewport.

## User feedback

User proposed: "if we, dump vh, set vw and set aspect ratio 265/390 will it be better" — after seeing the `vw+vh` approach distort. Confirmed as cleaner and applied.
