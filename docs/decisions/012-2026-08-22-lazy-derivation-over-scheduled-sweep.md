# ADR 012: Lazy derivation over scheduled sweep for active state

**Status**: Accepted
**Date**: 2026-08-22

## Decision

When a chara is "activated" (committed for the day), persist only `activatedAt = now()`. Do not run a scheduled job to flip the row back at 8AM. Instead, derive the effective active/standby state on every read by comparing `activatedAt` to the current 8AM cutoff.

## Rationale

For a solo project, a scheduler adds real infra weight: node-cron or an external scheduler, timezone coordination, a startup catch-up sweep for missed windows, and a job that must never race with user actions. Lazy derivation is a pure function of "now" and a nullable timestamp — no cron, no drift, and the DB row being "stale" is invisible because reads never expose the raw column. Trade-off: raw SQL on `activatedAt` doesn't answer "is it currently active?" without also applying the cutoff — every read path must go through the helper.

## User feedback

User weighed both approaches explicitly ("what if i do want the db state to record accurately? how would that work" → "so lazy derivation actually almost never touches the state...") and chose the lazy path with: "do the lazy approach."
