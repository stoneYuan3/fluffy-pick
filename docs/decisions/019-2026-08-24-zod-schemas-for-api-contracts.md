# ADR 019: Zod schemas for request/response contracts

**Status**: Accepted
**Date**: 2026-08-24

## Decision

All API bodies — request and response — are described by Zod schemas colocated per side (`backend/src/lib/schemas.ts`, `frontend/lib/schemas.ts`). Route handlers call `Schema.parse(req.body)` at the top and inferred types propagate through. On the frontend, `apiFetch` takes a response schema and parses before returning. A single Express error middleware translates ZodError → 400 with field details.

## Rationale

Applies Design by Contract from *The Pragmatic Programmer* — parse, don't validate. The schema is the contract: handlers can assume valid input, callers can assume valid output, and any mismatch fails loudly at the boundary rather than corrupting state downstream. Colocating one schema file per side avoids a shared package while still letting each side own its parser. Centralized error middleware means handlers stay linear (no repeated try/validate/respond blocks).

## User feedback

Commit message: "apply Design By Contract Principle from Pragmatic Programmer selectively" — user's explicit framing. "Selectively" is deliberate: internal helpers (already-parsed data) do not re-validate; only boundaries do.