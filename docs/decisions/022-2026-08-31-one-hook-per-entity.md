# ADR 022: One hook per entity (useCharas, useFoods)

**Status**: Accepted
**Date**: 2026-08-31

## Decision

Each first-class domain entity has one custom hook that owns its list state, fetch lifecycle, and mutation methods: `useCharas()`, `useFoods(scope)`. The hook exposes `{ items, error, reload, <mutation flags>, <mutation methods> }` and internally uses a shared `runMutation(setFlag, fn)` helper that sets the flag, clears error, runs the mutation, reloads on success, and stores the error on failure. Consumers get the setter for the list too (`setFoods`), so pages can perform optimistic updates without waiting for reload.

## Rationale

Extending the "one hook, one responsibility" idea from ADR 018 (useSelection) up to the entity layer. Pages stopped being fetch/error/flag boilerplate factories and now express intent (commit, archive, delete, drag-move). The shared `runMutation` helper collapses what would otherwise be 5+ near-identical try/catch/reload blocks per hook down to one, and enforces a consistent contract: mutations return `boolean` (success/failure), not throw.

## User feedback

Exposing `setFoods` from the return object was a later addition, driven by the drag-and-drop optimistic-move pattern (ADR 025) — the page needed to mutate the local list before the PUT resolved, without a full refetch flash.