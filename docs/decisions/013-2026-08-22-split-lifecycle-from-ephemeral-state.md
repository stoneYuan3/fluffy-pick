# ADR 013: Split lifecycle status from ephemeral state

**Status**: Accepted
**Date**: 2026-08-22

## Decision

`Card.status` is a persistent **lifecycle** field (`normal | archived`, later possibly `deleted`, etc.). The ephemeral active-vs-standby distinction lives entirely in a separate nullable `Card.activatedAt: DateTime?` and is derived on read (see ADR 012).

## Rationale

Overloading one column with two orthogonal concerns (persistent lifecycle vs. time-derived state) makes queries lie. `WHERE status='active'` would either mean "currently active" (requiring joint interpretation with a timestamp) or "was ever activated" (useless). Keeping them separate means archive filtering stays a real DB predicate (indexable, honest), while active-ness stays a pure computed property.

## User feedback

User asked "would it be better to handle this in Card's status field in backend, or would it better to somehow let frontend handle this?" and later confirmed they need `status` to stay meaningful for a future archive feature: "user can move a card to archive and archived card wont be displayed". That anchored the split.
