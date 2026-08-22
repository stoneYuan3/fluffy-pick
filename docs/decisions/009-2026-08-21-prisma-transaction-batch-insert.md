# ADR 009: Prisma $transaction for atomic batch insert

**Status**: Accepted
**Date**: 2026-08-21

## Decision

Wrap the array of `prisma.card.create` calls for a batch chara insert in `prisma.$transaction([...])` so the batch is all-or-nothing.

## Rationale

A partial success — some cards saved, some not — would leave the frontend in a confusing state and force per-row retry logic. Atomicity is cheap here (short transaction, no external calls) and pushes the "batch success" invariant down to the DB where it belongs.
