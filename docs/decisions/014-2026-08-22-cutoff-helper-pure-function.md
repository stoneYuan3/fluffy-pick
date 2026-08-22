# ADR 014: currentCutoff as a pure function

**Status**: Accepted
**Date**: 2026-08-22

## Decision

Extract the "when is today's 8AM cutoff?" logic into `backend/src/lib/cutoff.ts` as a pure function: `currentCutoff(now: Date = new Date()): Date`. It returns today's 8AM if `now >= 8AM`, else yesterday's 8AM.

## Rationale

Every read path that derives active/standby needs the same cutoff. Centralizing it as a pure, testable function prevents scattered inline `>= 8AM` checks that would drift. It also puts timezone handling in one place — when local vs. UTC vs. per-user timezone becomes a real question, this file is the one to change.
