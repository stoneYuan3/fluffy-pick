# ADR 024: Food entity mirrors Chara structure

**Status**: Accepted
**Date**: 2026-09-02

## Decision

`Food` is a new domain entity that reuses the Chara playbook: Prisma model with `id, name, description, photos[], status, lastActiveAt, activeNumber, createdDate, creatorId`; base64 photo storage (per ADR 007); Zod-validated CRUD routes at `/food` with GET split by status (`/food/normal`, `/food/active`); a dedicated `useFoods(scope)` hook. `status` is a persistent string union (`"normal" | "active"`) — no `archived` state for foods yet.

## Rationale

Two GET endpoints instead of one filtered endpoint keeps the client trivially cache-scoped (one hook per scope, no query-param plumbing) and lets each scope pick a different `orderBy` (`createdDate desc` for normal, `lastActiveAt desc` for active) without conditionals. Mirroring Chara's shape means the frontend can reuse the same `runMutation` pattern (ADR 022) and card-shell composition idea (ADR 004) without inventing a new architecture.

## User feedback

Foods are a distinct product area from Chara but the shape of "list of user-owned things with photos and a lifecycle" is the same — reusing the pattern was intentional, not accidental.