# ADR 015: POST /chara/commit for batch activation

**Status**: Accepted
**Date**: 2026-08-22

## Decision

A dedicated `POST /chara/commit` endpoint takes `{ ids: number[] }`, and in one `prisma.card.updateMany` sets `activatedAt = now()` and `assigned += 1` for the matching cards owned by the caller with `status = "normal"`.

## Rationale

Commit is a distinct action from create — separate route matches the mental model and keeps handler bodies focused. `updateMany` with a `creatorId` filter enforces ownership at the query level, so no per-row auth check is needed and unauthorized ids silently no-op instead of leaking existence.

## User feedback

User asked to "proceed with the next steps: helper API, endpoint to adjust activatedAt, front end UI" — this endpoint is the "adjust activatedAt" piece of that request.
