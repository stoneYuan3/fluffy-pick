# ADR 028: Compound component pattern for cards

**Status**: Accepted
**Date**: 2026-09-03

## Decision

Reusable card primitives use the compound component (dot-notation) pattern: a shell owns layout + interaction, and named sub-components own the render of each slot. `SmallCard` exposes `SmallCard.Image`, `SmallCard.Body`, `SmallCard.Title`, and `SmallCard.Action`, wired together via `Object.assign(SmallCardShell, { Image, Body, Title, Action })`. Entity-specific cards (e.g. `FoodCard`) compose these slots with their own domain data — they never re-implement the layout or re-declare the CSS classes.

## Rationale

Total separation between render structure and per-entity functionality. The shell defines *what a small card is* (flex row, padding, click behavior); the slots define *what each region looks like* in isolation; the composing card decides *which slots to fill and with what*. This keeps the DRY principle honest — no more copy-pasting the flex/padding/cover markup between `FoodCard` and the inline chara markup on the home page — while decoupling the shell from any consumer's specific combination of parts. New card types (chara small card, place small card) opt into whichever slots they need and skip the rest, without the shell needing to know they exist.

Compared to the previous shape (`SmallCard` with `image` + `text` + `onClick` props), the compound API scales: adding an `Action` region for the food check button no longer requires teaching `SmallCard` about it — the food card just fills the `Action` slot.

## User feedback

User led this refactor themselves after learning the pattern from a Claude conversation (<https://claude.ai/share/7d5874c8-4d35-4321-b396-1413b5ec9582>), and framed the goal as "total separation between render and functionality to ensure DRY principle while decoupling components." The FoodCard rewrite in the same commit is the reference example: check-button lives in `SmallCard.Action`, cover in `SmallCard.Image`, name in `SmallCard.Title`, all with zero duplicated layout.
