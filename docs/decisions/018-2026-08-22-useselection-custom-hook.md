# ADR 018: useSelection custom hook

**Status**: Accepted
**Date**: 2026-08-22

## Decision

Selection-set management lives in a generic custom hook `useSelection<T>()` at `frontend/hooks/use-selection.ts`, exposing `{ ids, has, toggle, add, remove, clear, size }`. Pages consume it instead of managing a `Set<T>` in local state.

## Rationale

React state changes must go through setters to trigger re-renders, so a plain module holding a mutable `Set` (the user's initial sketch) can't work — a hook is the idiomatic way to package stateful behavior for reuse. Generics let the same hook drive card selection on Home, delete selection on Archive, and any future card-type flow without duplication.

## User feedback

User proposed the extraction based on the "one component, one responsibility" principle, and justified reuse with three concrete anticipated call sites: "one on this page where user select to move them to archive, one on archive page where it is select to delete, then in future i might add more card types (like, fav location cards) where same select mechanism will still come in handy." That reuse profile made the abstraction worth doing now rather than deferring.
