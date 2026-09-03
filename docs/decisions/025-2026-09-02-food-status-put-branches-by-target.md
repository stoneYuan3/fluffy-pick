# ADR 025: PUT /food/status branches by target status

**Status**: Accepted
**Date**: 2026-09-02

## Decision

`PUT /food/status` accepts `{ ids, status }` and applies different side effects depending on the target:
- `status: "active"` — set `status`, stamp `lastActiveAt = now()`.
- `status: "normal"` — set `status`, atomically `activeNumber: { increment: 1 }`, and scope the update to rows currently `status: "active"` so the counter never double-increments.

## Rationale

The two transitions carry different semantics: activating is a "start of a session" event (needs a timestamp for ordering), while returning to normal represents a completed session (needs a count). Bundling both under one endpoint keeps the client API surface tiny (`setStatus(ids, target)`), while the backend owns the side-effect logic — the client doesn't need to know that "check off a food" both flips the flag and bumps a counter. The `where: { status: "active" }` guard makes the check-off idempotent: replaying the request cannot inflate `activeNumber` beyond one bump per actual transition.

## User feedback

The counter design predates this endpoint; this ADR captures the choice to put the increment on the *backend transition handler* rather than on a separate `POST /food/:id/consume` endpoint, which would have required the client to reason about ordering.