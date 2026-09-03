# ADR 023: Circular rotate adder replaces sequential add-card flow

**Status**: Accepted
**Date**: 2026-08-31

## Decision

The add-card flow is a circular carousel: N slots arranged around a ring, rotated by mouse wheel or touch swipe (touch delta threshold ≈ 40px). All slots are pre-allocated in state; only filled ones are submitted. The slot at the top-center is the "active" one being edited. Mouse-wheel and touch-drag both step the rotation.

## Rationale

The previous linear "add → next → add → next" form gave no sense of how much the user had added, made reordering impossible, and felt clunky on touch. A circular layout puts the whole batch on screen, makes ordering a spatial property, and gives a natural gesture (spin) for navigation. Pre-allocating slots keeps the state shape uniform and simplifies "which one is active" (an index, not a growing list).

## User feedback

Multiple exploratory prototypes preceded this (`/add-card/test`, `/add-card/test2` with scroll-snap) — the rotate variant was chosen after live comparison. Mobile touch support was added deliberately in a follow-up commit, confirming the pattern must work on phone/tablet as a first-class target.