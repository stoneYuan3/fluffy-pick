# ADR 010: Container queries (cqw) for board-scoped scaling

**Status**: Accepted
**Date**: 2026-08-22

## Decision

Set `container-type: inline-size` on `.chara-board` and size its children (card widths, name font size, etc.) in `cqw` units.

## Rationale

The board holds a fixed 1080/768 aspect ratio, so cards and text inside should scale with the *board's* width — not the viewport's. Container queries make that "child scales relative to its container" relationship native, without JS-driven resize observers or brittle nested-percentage math.

## User feedback

User asked for the board to "stay in the porpotion of 1080/768px and cards inside it should adjust font size accordingly" — container queries were the clean fit for that requirement.
