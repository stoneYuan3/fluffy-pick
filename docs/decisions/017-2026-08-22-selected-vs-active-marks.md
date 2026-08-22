# ADR 017: Selected vs active as visually distinct marks

**Status**: Accepted
**Date**: 2026-08-22

## Decision

`CardState === "selected"` renders a small red dot in the top-right corner. `CardState === "active"` renders a semi-transparent black overlay with the text "侍寝中". Both are produced by a single conditional block in `CharaCardShell`, with modifier classes `card-mark--selected` and `card-mark--active` styling the visual difference.

## Rationale

The two states carry different meanings — "selected" is a transient user action pending confirmation, "active" is a persistent day-scoped commitment — so they should be visually distinguishable at a glance rather than sharing one overlay. Keeping the render logic in one conditional block makes the mutual exclusion obvious and keeps the shell markup uncluttered.

## User feedback

User first accepted a single shared overlay, then corrected: "selected state and active state actually should have two different overlays / under selected state render a red dot on top right corner with no overlay / under active state render a transparent black overlay with text '侍寝中' / but of course it would be great if they are all mananged under the same div element."
