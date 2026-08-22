# ADR 003: String union over enum for CardState

**Status**: Accepted
**Date**: 2026-08-21

## Decision

Represent `CardState` as a TypeScript string union (`"normal" | "add" | "deco" | ...`) instead of a TypeScript `enum`.

## Rationale

String unions serialize naturally (JSON, DOM `data-*` attributes), compare with `===`, and emit no runtime code — the type disappears at compile time. TS `enum` (especially non-const) generates a runtime object, adds friction around JSON boundaries, and is broadly considered a legacy feature by the TypeScript community.

## User feedback

User confirmed: "switch to string-union since you suggest it is better than enum" — validated the recommendation and asked to make the change.
